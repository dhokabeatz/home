import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { apiService, Contact } from "../../services/api";

type ContactStatus = "UNREAD" | "READ" | "ARCHIVED";

const AdminContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ContactStatus>(
    "all"
  );

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getContacts();
      setContacts(response.contacts);
    } catch (error) {
      toast.error("Failed to fetch contacts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: ContactStatus) => {
    try {
      await apiService.updateContact(id, { status });
      setContacts(
        contacts.map((contact) =>
          contact.id === id ? { ...contact, status } : contact
        )
      );
      toast.success("Contact status updated");
    } catch (error) {
      toast.error("Failed to update contact status");
      console.error(error);
    }
  };

  const handleSelectContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.filter((contactId) => contactId !== id)
        : [...prev, id]
    );
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      (contact.name && contact.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.message && contact.message.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    const filteredIds = filteredContacts.map((contact) => contact.id);
    if (selectedContacts.length === filteredIds.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredIds);
    }
  };

  const handleBulkAction = async (
    action: "read" | "unread" | "archived" | "delete"
  ) => {
    if (selectedContacts.length === 0) {
      toast.error("Please select contacts first");
      return;
    }

    try {
      if (action === "delete") {
        await Promise.all(
          selectedContacts.map((id) => apiService.deleteContact(id))
        );
        toast.success(`Deleted ${selectedContacts.length} contacts`);
      } else {
        const status = action.toUpperCase() as ContactStatus;
        await Promise.all(
          selectedContacts.map((id) => apiService.updateContact(id, { status }))
        );
        toast.success(
          `Updated ${selectedContacts.length} contacts to ${action}`
        );
      }

      // Reload contacts after bulk operations
      const response = await apiService.getContacts();
      setContacts(response.contacts);
      setSelectedContacts([]);
    } catch (error) {
      toast.error(`Failed to ${action} contacts`);
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UNREAD":
        return "bg-blue-100 text-blue-800";
      case "READ":
        return "bg-green-100 text-green-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
        <div className="text-sm text-gray-600">
          {contacts.length} total contacts
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              id="contacts-search"
              name="search"
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            id="contacts-status-filter"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedContacts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction("read")}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Mark as Read ({selectedContacts.length})
            </button>
            <button
              onClick={() => handleBulkAction("unread")}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Mark as Unread ({selectedContacts.length})
            </button>
            <button
              onClick={() => handleBulkAction("archived")}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Archive ({selectedContacts.length})
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete ({selectedContacts.length})
            </button>
          </div>
        )}
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    id="contacts-select-all"
                    name="selectAll"
                    type="checkbox"
                    checked={
                      selectedContacts.length === filteredContacts.length &&
                      filteredContacts.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      id={`contact-checkbox-${contact.id}`}
                      name={`contactSelect-${contact.id}`}
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {contact.message.length > 50
                        ? `${contact.message.substring(0, 50)}...`
                        : contact.message}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      id={`contact-status-${contact.id}`}
                      name={`contactStatus-${contact.id}`}
                      value={contact.status}
                      onChange={(e) =>
                        handleStatusChange(
                          contact.id,
                          e.target.value as ContactStatus
                        )
                      }
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}
                    >
                      <option value="UNREAD">Unread</option>
                      <option value="READ">Read</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(contact.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        // You can implement a modal or detailed view here
                        alert(`Message: ${contact.message}`);
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      View Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredContacts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No contacts found
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminContacts;
