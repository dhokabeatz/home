import { IsString, MinLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
  @ApiProperty({ description: "Current password" })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: "New password" })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
  })
  newPassword: string;
}
