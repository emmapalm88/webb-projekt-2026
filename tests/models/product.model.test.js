import { describe, it, expect, beforeEach } from "vitest";
import Product from "../../src/models/Product.js";
import { clearDatabase } from "../setup.js";

describe("Product model", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("should create a new product", async () => {
    const product = new Product({
      name: "Product 1",
      price: 100,
      stock: 10,
      image: "image.jpg",
      slug: "product-1",
    });
    await product.save();
    expect(product).toBeDefined();
  });

  it("should not create a product with a negative price", async () => {
    const product = new Product({
      name: "Product 1",
      price: -100,
      stock: 10,
      image: "image.jpg",
      slug: "product-1",
    });
    await expect(product.save()).rejects.toThrow();
  });

  it("should not create a product with a negative stock", async () => {
    const product = new Product({
      name: "Product 1",
      price: 100,
      stock: -10,
      image: "image.jpg",
      slug: "product-1",
    });
    await expect(product.save()).rejects.toThrow();
  });
});