import "reflect-metadata";
import { IsNotEmpty, IsNumber, IsPositive, validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { ProjectInput } from "./components/project/input";
import { ProjectList } from "./components/project/list";

new ProjectInput();
new ProjectList("active");
new ProjectList("finished");

const products = [
  { title: "商品1", price: 100 },
  { title: "商品2", price: 200 },
];

class Product {
  @IsNotEmpty()
  title: string;
  @IsNumber()
  @IsPositive()
  price: number;

  constructor(t: string, p: number) {
    this.title = t;
    this.price = p;
  }

  getInformation() {
    return [this.title, `${this.price}円`];
  }
}

const newProd = new Product("", -10);
validate(newProd).then((errors) => {
  if (errors.length > 0) {
    console.log("バリデーションエラー");
    console.log(errors);
  } else {
    console.log(newProd.getInformation());
  }
});

const loadedProducts = plainToInstance(Product, products);

for (const prod of loadedProducts) {
  console.log(prod.getInformation());
}
