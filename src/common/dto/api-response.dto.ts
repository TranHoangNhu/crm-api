/** Standardized API response format */
export class ApiResponse<T = any> {
  constructor(
    public readonly data: T | null,
    public readonly success: boolean,
    public readonly message?: string,
  ) {}

  static ok<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(data, true, message);
  }

  static created<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(data, true, message ?? 'Tạo thành công');
  }

  static success(message?: string): ApiResponse<null> {
    return new ApiResponse(null, true, message ?? 'Thành công');
  }
}
