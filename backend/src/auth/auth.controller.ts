import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Response,
  Get,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Throttle } from "@nestjs/throttler";
import { Response as ExpressResponse } from "express";

import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @UseGuards(AuthGuard("local"))
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: "Admin login" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(
    @Request() req,
    @Body() loginDto: LoginDto,
    @Response() res: ExpressResponse,
  ) {
    const result = await this.authService.login(req.user);

    // Set HTTP-only cookies
    res.cookie("access_token", result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("refresh_token", result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.cookie("isAuthenticated", "true", {
      httpOnly: false, // This one can be read by frontend for UI state
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ user: result.user });
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  async refresh(@Request() req, @Response() res: ExpressResponse) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
      const result = await this.authService.refreshToken(refreshToken);

      // Set new HTTP-only cookies
      res.cookie("access_token", result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie("refresh_token", result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.json({ user: result.user });
    } catch (error) {
      console.error("Refresh token failed:", error);
      // Clear cookies on refresh failure
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");
      res.clearCookie("isAuthenticated");
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@Request() req) {
    return { user: req.user };
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout and clear cookies" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  async logout(@Response() res: ExpressResponse) {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.clearCookie("isAuthenticated");
    return res.json({ message: "Logout successful" });
  }
}
