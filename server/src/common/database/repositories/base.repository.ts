import { Model } from 'mongoose';

export abstract class BaseRepository<T> {
  protected constructor(
    protected readonly model: Model<T>,
  ) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async find(filter: Partial<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async updateById(
    id: string,
    update: Partial<T>,
  ): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}