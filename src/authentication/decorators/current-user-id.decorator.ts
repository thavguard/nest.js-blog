import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtStrategyValidateDto } from "../dtos/jwt-strategy-validate.dto";

export const CurrentUser = createParamDecorator(
  (data: keyof JwtStrategyValidateDto, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();
    console.log(user);
    return data ? user[data] : user;
  }
);
