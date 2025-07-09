import { IsString } from "class-validator";

export class SecretKeyWebScraping {
  @IsString()
  SecretKey: string;
}
