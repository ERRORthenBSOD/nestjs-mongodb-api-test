import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.model';

@Injectable()
export class ProductsService {
  private products: Product[] = [];

  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async insertProduct(
    title: string,
    description: string,
    price: number,
  ): Promise<string> {
    const newProduct = new this.productModel({
      title,
      description,
      price,
    });
    const result = await newProduct.save();
    return result.id as string;
  }

  async getAllProducts() {
    const products = await this.productModel.find().exec();
    return products.map(prod => {
      return {
        id: prod._id,
        title: prod.title,
        description: prod.description,
        price: prod.price,
      };
    });
  }

  async getSingleProduct(id: string) {
    const product = await this.findProduct(id);
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async updateProduct(
    prodId: string,
    title: string,
    description: string,
    price: number,
  ) {
    const product = await this.findProduct(prodId);
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    await product.save();
    return;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.findProduct(id);
    console.log(product.id);

    await this.productModel.deleteOne({ _id: product.id }).exec();
    return;
  }

  private async findProduct(id: string): Promise<Product> {
    let product;
    try {
      product = await this.productModel.findById(id);
    } catch (e) {
      throw new NotFoundException('Could not find product.');
    }
    if (!product) throw new NotFoundException('Could not find product.');
    return product;
  }
}
