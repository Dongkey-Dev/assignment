import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Condition } from '../schemas/condition.schema';
import { UserAction } from '../schemas/user-action.schema';

@Injectable()
export class ConditionCheckerService {
  constructor(
    @InjectModel(Condition.name) private conditionModel: Model<Condition>,
    @InjectModel(UserAction.name) private userActionModel: Model<UserAction>,
  ) {}

  /**
   * Check if a condition is met for a specific user
   * @param conditionId - The ID of the condition to check
   * @param userId - The ID of the user to check against
   * @returns A boolean indicating if the condition is met and the current count
   */
  async checkCondition(
    conditionId: string,
    userId: string,
  ): Promise<{ isMet: boolean; currentCount: number }> {
    // Find the condition
    const condition = await this.conditionModel.findById(conditionId).exec();
    if (!condition) {
      throw new Error(`Condition with ID ${conditionId} not found`);
    }

    // Check if the condition is active
    if (condition.status === 'inactive') {
      return {
        isMet: false,
        currentCount: 0,
      };
    }

    // Check if the current date is within the condition period
    const now = new Date();
    if (now < condition.period.start || now > condition.period.end) {
      return {
        isMet: false,
        currentCount: 0,
      };
    }

    // Build the query based on the targetCountQuery
    const { targetCountQuery, targetCount } = condition;
    const { targetCollection, filter, sum } = targetCountQuery;

    // Replace placeholders in the filter
    const processedFilter = this.processFilter(filter, { userId, condition });

    // Execute the query based on the collection
    let currentCount = 0;

    if (targetCollection === 'user_actions') {
      if (sum) {
        // Sum a specific field
        const result = await this.userActionModel
          .aggregate([
            { $match: processedFilter },
            { $group: { _id: null, total: { $sum: `$${sum}` } } },
          ])
          .exec();

        currentCount = result.length > 0 ? result[0].total : 0;
      } else {
        // Count documents
        currentCount = await this.userActionModel
          .countDocuments(processedFilter)
          .exec();
      }
    }

    return {
      isMet: currentCount >= targetCount,
      currentCount,
    };
  }

  /**
   * Process the filter to replace placeholders with actual values
   * @param filter - The filter object with placeholders
   * @param params - The parameters to replace placeholders with
   * @returns The processed filter
   */
  private processFilter(
    filter: any,
    params: { userId: string; condition: Condition },
  ): any {
    const { userId, condition } = params;
    const { period } = condition;

    // Create a deep copy of the filter
    const processedFilter = JSON.parse(JSON.stringify(filter));

    // Process the filter recursively
    this.processFilterObject(processedFilter, {
      userId,
      startDate: period.start,
      endDate: period.end,
    });

    return processedFilter;
  }

  private processFilterObject(
    obj: any,
    replacements: { userId: string; startDate: Date; endDate: Date },
  ): void {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively process nested objects
        this.processFilterObject(obj[key], replacements);
      } else if (typeof obj[key] === 'string') {
        // Replace placeholders in string values
        if (obj[key] === '{{userId}}') {
          obj[key] = replacements.userId;
        } else if (obj[key] === '{{startDate}}') {
          obj[key] = replacements.startDate;
        } else if (obj[key] === '{{endDate}}') {
          obj[key] = replacements.endDate;
        }
      }
    }
  }
}
