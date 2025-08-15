import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { InitializePaymentDto, VerifyPaymentDto } from "./dto/payment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post("initialize")
  async initializePayment(
    @Body() initializePaymentDto: InitializePaymentDto,
    @Query("userId") _userId?: string,
  ) {
    const userInfo = {
      email: initializePaymentDto.email,
      amount: initializePaymentDto.amount,
      currency: initializePaymentDto.currency,
      metadata: initializePaymentDto.metadata,
    };
    return this.paymentsService.purchaseProject(
      initializePaymentDto.projectId,
      userInfo,
    );
  }

  @Post("verify")
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(verifyPaymentDto.reference);
  }

  @UseGuards(JwtAuthGuard)
  @Get("purchases")
  async getUserPurchases(@Request() req) {
    return this.paymentsService.getUserPurchases(req.user.email);
  }

  @Get("access/:projectId")
  async checkProjectAccess(
    @Param("projectId") projectId: string,
    @Query("email") email: string,
  ) {
    if (!email) {
      return { hasAccess: false, message: "Email is required" };
    }

    const result = await this.paymentsService.checkProjectAccess(
      projectId,
      email,
    );
    return result;
  }

  @Get("config")
  async getPaymentConfig() {
    return {
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || "pk_test_demo_key",
      message: "Payment system enabled (Demo mode)",
      demoMode: !process.env.PAYSTACK_SECRET_KEY,
    };
  }
}
