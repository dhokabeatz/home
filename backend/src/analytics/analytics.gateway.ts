import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3004"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  namespace: "/analytics",
})
export class AnalyticsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AnalyticsGateway.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Send initial analytics data to the connected client
    this.sendAnalyticsUpdate(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("requestAnalyticsUpdate")
  async handleAnalyticsRequest(@ConnectedSocket() client: Socket) {
    this.logger.log("Analytics update requested");
    await this.sendAnalyticsUpdate(client);
  }

  @SubscribeMessage("subscribeToAnalytics")
  async handleSubscription(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to analytics updates`);
    client.join("analytics-room");
    await this.sendAnalyticsUpdate(client);
  }

  @SubscribeMessage("unsubscribeFromAnalytics")
  handleUnsubscription(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} unsubscribed from analytics updates`);
    client.leave("analytics-room");
  }

  /**
   * Send current analytics data to a specific client
   */
  private async sendAnalyticsUpdate(client: Socket) {
    try {
      const analyticsData =
        await this.analyticsService.getComprehensiveAnalytics();
      client.emit("analyticsUpdate", analyticsData);
    } catch (error) {
      this.logger.error("Error sending analytics update:", error);
      client.emit("analyticsError", {
        message: "Failed to fetch analytics data",
      });
    }
  }

  /**
   * Broadcast analytics update to all subscribed clients
   */
  async broadcastAnalyticsUpdate() {
    try {
      const analyticsData =
        await this.analyticsService.getComprehensiveAnalytics();
      this.server.to("analytics-room").emit("analyticsUpdate", analyticsData);
      this.logger.log("Analytics update broadcasted to all subscribers");
    } catch (error) {
      this.logger.error("Error broadcasting analytics update:", error);
    }
  }

  /**
   * Broadcast real-time visitor activity
   */
  broadcastVisitorActivity(activity: {
    type: "visit" | "page_view" | "interaction" | "download";
    page?: string;
    action?: string;
    timestamp: Date;
    userAgent?: string;
    location?: string;
  }) {
    this.server.to("analytics-room").emit("visitorActivity", activity);
    this.logger.log(`Visitor activity broadcasted: ${activity.type}`);
  }

  /**
   * Get the number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.server.sockets.sockets.size;
  }

  /**
   * Send live visitor count update
   */
  broadcastLiveVisitorCount() {
    const count = this.getConnectedClientsCount();
    this.server.to("analytics-room").emit("liveVisitorCount", { count });
  }
}
