import { IsString, IsEmail, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PublicContactDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  name: string;

  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: "+1234567890" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: "I would like to discuss a project opportunity." })
  @IsString()
  message: string;
}
