import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  data?: T;

  @ApiProperty()
  message?: string;
}

export function asApiResponse<T>(
  data?: T,
  message?: string,
): ApiResponseDto<T> {
  return {
    data: data ?? null,
    message,
  };
}
