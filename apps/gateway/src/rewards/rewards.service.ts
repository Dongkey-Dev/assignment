import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  CreateRewardDto,
  RewardResponseDto,
  RequestRewardDto,
  RewardHistoryResponseDto,
} from '@libs/shared/src/dtos/reward.dto';

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(error: unknown): ErrorWithMessage {
  if (isErrorWithMessage(error)) return error;
  try {
    return new Error(JSON.stringify(error));
  } catch {
    // fallback in case there's an error stringifying the error
    return new Error(String(error));
  }
}

function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);
  private readonly eventServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.eventServiceUrl =
      this.configService.get<string>('EVENT_SERVICE_URL') ||
      'http://event:3003';
  }

  async createReward(
    createRewardDto: CreateRewardDto,
  ): Promise<RewardResponseDto> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post<RewardResponseDto>(
            `${this.eventServiceUrl}/v1/rewards`,
            createRewardDto,
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Error creating reward: ${getErrorMessage(error)}`,
                error.stack,
              );
              throw this.handleHttpError(error);
            }),
          ),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to create reward: ${getErrorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async getRewardById(id: string): Promise<RewardResponseDto> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<RewardResponseDto>(`${this.eventServiceUrl}/v1/rewards/${id}`)
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Error getting reward: ${getErrorMessage(error)}`,
                error.stack,
              );
              throw this.handleHttpError(error);
            }),
          ),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to get reward: ${getErrorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async getAllRewards(): Promise<RewardResponseDto[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<RewardResponseDto[]>(`${this.eventServiceUrl}/v1/rewards`)
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Error getting all rewards: ${getErrorMessage(error)}`,
                error.stack,
              );
              throw this.handleHttpError(error);
            }),
          ),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to get all rewards: ${getErrorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async getRewardsByEventId(eventId: string): Promise<RewardResponseDto[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<
            RewardResponseDto[]
          >(`${this.eventServiceUrl}/v1/events/${eventId}/rewards`)
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Error getting rewards by event ID: ${getErrorMessage(error)}`,
                error.stack,
              );
              throw this.handleHttpError(error);
            }),
          ),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to get rewards by event ID: ${getErrorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async requestReward(
    requestRewardDto: RequestRewardDto,
  ): Promise<RewardHistoryResponseDto> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post<RewardHistoryResponseDto>(
            `${this.eventServiceUrl}/v1/rewards/request`,
            requestRewardDto,
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Error requesting reward: ${getErrorMessage(error)}`,
                error.stack,
              );
              throw this.handleHttpError(error);
            }),
          ),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to request reward: ${getErrorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async getRewardHistory(userId?: string): Promise<RewardHistoryResponseDto[]> {
    try {
      const params = userId ? { userId } : {};
      const { data } = await firstValueFrom(
        this.httpService
          .get<
            RewardHistoryResponseDto[]
          >(`${this.eventServiceUrl}/v1/rewards/history`, { params })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Error getting reward history: ${getErrorMessage(error)}`,
                error.stack,
              );
              throw this.handleHttpError(error);
            }),
          ),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to get reward history: ${getErrorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private handleHttpError(error: AxiosError): HttpException {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Unknown error';

    switch (status) {
      case HttpStatus.NOT_FOUND:
        return new NotFoundException(message);
      case HttpStatus.BAD_REQUEST:
        return new BadRequestException(message);
      case HttpStatus.CONFLICT:
        return new ConflictException(message);
      default:
        return new HttpException(message, status);
    }
  }
}
