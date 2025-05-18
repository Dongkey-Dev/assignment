import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAction } from '@libs/common/schemas/user-action.schema';
import { MockActionDto } from '@libs/shared/src/dtos/action.dto';

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(UserAction.name) private userActionModel: Model<UserAction>,
  ) {}

  async createMockAction(mockActionDto: MockActionDto): Promise<UserAction> {
    // 현재 시간이 제공되지 않은 경우 현재 시간 사용
    const timestamp = mockActionDto.timestamp || new Date();

    const newAction = new this.userActionModel({
      ...mockActionDto,
      timestamp,
      createdAt: new Date(),
    });

    return newAction.save();
  }
}
