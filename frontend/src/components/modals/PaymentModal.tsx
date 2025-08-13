import { useState, useEffect } from "react";
import { X, CreditCard, Shield, Check } from "lucide-react";
import { Project } from "../../services/api";
import { useAlert } from "../../contexts/AlertContext";

// Declare Paystack types
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        callback: (response: { reference: string; status: string }) => void;
        onClose: () => void;
        metadata?: any;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaymentModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reference: string) => void;
}

export default function PaymentModal({
  project,
  isOpen,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});
  const { showError, showWarning } = useAlert();

  useEffect(() => {
    // Load Paystack script
    if (!document.getElementById("paystack-js")) {
      const script = document.createElement("script");
      script.id = "paystack-js";
      script.src = "https://js.paystack.co/v1/inline.js";
      document.head.appendChild(script);
    }

    // Fetch Paystack public key
    fetchPaymentConfig();
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      const apiUrl =
        (window as any).env?.VITE_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/payments/config`);
      const data = await response.json();
      setPaystackPublicKey(data.publicKey);
    } catch (error) {
      console.error("Error fetching payment config:", error);
    }
  };
  const validateForm = () => {
    const newErrors: { email?: string; name?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentVerification = async (reference: string) => {
    setIsLoading(true);

    try {
      // Verify payment with backend
      const apiUrl =
        (window as any).env?.VITE_API_URL || "http://localhost:4000";
      const verifyResponse = await fetch(`${apiUrl}/api/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reference: reference,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.message || "Payment verification failed");
      }

      const verificationResult = await verifyResponse.json();
      console.log("Payment verification result:", verificationResult);

      // Only call onSuccess if payment was verified successfully
      if (verificationResult.payment_verified) {
        onSuccess(reference);
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      showError(
        "Payment Verification Failed",
        error instanceof Error
          ? error.message
          : "Payment verification failed. Please contact support if your payment was successful."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    // Prevent multiple simultaneous requests
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Initialize payment with backend
      const apiUrl =
        (window as any).env?.VITE_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/payments/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          projectId: project.id,
          amount: project.price,
          currency: project.currency,
          email: email,
          metadata: JSON.stringify({ customerName: name }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle duplicate purchase specifically
        if (
          errorData.message &&
          errorData.message.includes("already purchased")
        ) {
          setIsLoading(false); // Reset loading state before showing warning
          showWarning(
            "Project Already Purchased",
            "You have already purchased this project. You should have access to the source code.",
            [
              {
                label: "Contact Support",
                action: () => {
                  window.location.href =
                    "mailto:support@yoursite.com?subject=Access Issue";
                  onClose(); // Close the modal after opening email
                },
                variant: "primary",
              },
              {
                label: "Close",
                action: () => {
                  onClose(); // Close the payment modal
                },
                variant: "secondary",
              },
            ]
          );
          return;
        }

        throw new Error(errorData.message || "Failed to initialize payment");
      }

      const { reference } = await response.json();

      // Open Paystack payment modal
      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: paystackPublicKey,
          email: email,
          amount: (project.price || 0) * 100, // Convert to kobo/cents
          currency: project.currency,
          ref: reference,
          metadata: {
            customerName: name,
            projectId: project.id,
          },
          callback: (response) => {
            console.log("Payment completed:", response);
            // Don't set loading here, handle verification separately
            handlePaymentVerification(response.reference);
          },
          onClose: () => {
            console.log("Payment modal closed");
            setIsLoading(false);
          },
        });

        handler.openIframe();
      } else {
        throw new Error(
          "Paystack is not loaded. Please refresh and try again."
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      showError(
        "Payment Error",
        error instanceof Error
          ? error.message
          : "Failed to process payment. Please try again."
      );
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <button
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity cursor-pointer w-full h-full border-none"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-label="Close modal"
      ></button>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Purchase Project
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Project Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-1">
                {project.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {project.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary-600">
                  {project.currency} {project.price}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Premium Project
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">What you get:</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Complete source code access
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Documentation and setup guide
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Lifetime access to updates
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Commercial usage rights
                </li>
              </ul>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start mt-6 p-3 bg-blue-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Secure Payment
                </p>
                <p className="text-xs text-blue-600">
                  Your payment is processed securely through Paystack with SSL
                  encryption.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isLoading || !paystackPublicKey}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isLoading
                ? "Processing..."
                : `Pay ${project.currency} ${project.price}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
