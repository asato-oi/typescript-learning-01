/** auto bind decorator */
function autoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this);
    },
  };
  return adjDescriptor;
}

class ProjectInput {
  private SELECTOR = {
    selectorApp: ".js-app",
    selectorForm: ".js-project-form",
    selectorTitle: ".js-project-title",
    selectorDescription: ".js-project-description",
    selectorManDay: ".js-project-manDay",
  };

  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  manDayInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.querySelector(this.SELECTOR.selectorForm)!;
    this.hostElement = document.querySelector(this.SELECTOR.selectorApp)!;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.titleInputElement = this.element.querySelector(
      this.SELECTOR.selectorTitle
    )!;
    this.descriptionInputElement = this.element.querySelector(
      this.SELECTOR.selectorDescription
    )!;
    this.manDayInputElement = this.element.querySelector(
      this.SELECTOR.selectorManDay
    )!;

    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredManDay = this.manDayInputElement.value;

    if (
      enteredTitle.trim().length === 0 ||
      enteredDescription.trim().length === 0 ||
      enteredManDay.trim().length === 0
    ) {
      alert("入力値が正しくありません。再度お試しください");
      return;
    }

    return [enteredTitle, enteredDescription, Number(enteredManDay)];
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.manDayInputElement.value = "";
  }

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, description, manDay] = userInput;
      console.log(title, description, manDay);
    }

    this.clearInputs();
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

new ProjectInput();

// ---

// function Logger(log: string) {
//   return function (constructor: Function) {
//     console.log(log);
//     console.log(constructor);
//   };
// }

// function WithTemplate(template: string, hookId: string) {
//   return function <T extends { new (...args: any[]): { name: string } }>(
//     originalConstructor: T
//   ) {
//     return class extends originalConstructor {
//       constructor(..._: any[]) {
//         super();
//         console.log("テンプレートを表示");
//         const hookEL = document.querySelector(hookId);
//         if (hookEL) {
//           hookEL.innerHTML = template;
//           hookEL.querySelector("p")!.textContent = this.name;
//         }
//       }
//     };
//   };
// }
// @Logger("ログ出力中")
// @WithTemplate("<p>サンプル</p>", ".js-hoge")
// class Person {
//   name = "Max";

//   constructor() {
//     console.log("Personオブジェクトを作成中");
//   }
// }

// const pers = new Person();

// console.log(pers);

// ---

// // デコレータ関数は、クラスが定義されたタイミングで実行がされる
// /**
//  * Propertyのデコーレータ関数のサンプル。
//  * @param target クラスのプロトタイプが渡される。｜static propertyの場合はコンストラクターが渡される
//  * @param propertyName プロパティのキー名
//  */
// function Log(target: any, propertyName: string | Symbol) {
//   console.log("Property デコレータ");
//   console.log(target, propertyName);
// }

// /**
//  * Accessorのデコーレータ関数のサンプル。
//  * @param target クラスのプロトタイプが渡される。
//  * @param name Accessorのメソッド名
//  * @param descriptor PropertyDescriptor <https://qiita.com/hosomichi/items/db5c501272b622fdd848>
//  */
// function Log2(target: any, name: string, descriptor: PropertyDescriptor) {
//   console.log("Accessor デコレータ");
//   console.log(target);
//   console.log(name);
//   console.log(descriptor);
// }

// /**
//  * methodのデコーレータ関数のサンプル。
//  * @param target クラスのプロトタイプが渡される。｜static propertyの場合はコンストラクターが渡される
//  * @param methodName メソッド名
//  * @param descriptor PropertyDescriptor
//  */
// function Log3(
//   target: any,
//   methodName: string | Symbol,
//   descriptor: PropertyDescriptor
// ) {
//   console.log("method デコレータ");
//   console.log(target);
//   console.log(methodName);
//   console.log(descriptor);
// }

// /**
//  * parameter デコレータ関数のサンプル
//  * @param target クラスのプロトタイプが渡される。｜static propertyの場合はコンストラクターが渡される
//  * @param methodName そのパラメータを引数としているメソッド名
//  * @param position 引数の位置
//  */
// function Log4(target: any, methodName: string | Symbol, position: number) {
//   console.log("Parameter デコレータ");
//   console.log(target);
//   console.log(methodName);
//   console.log(position);
// }

// class Product {
//   @Log
//   title: string;
//   private _price: number;

//   constructor(t: string, p: number) {
//     this.title = t;
//     this._price = p;
//   }

//   @Log2
//   set price(val: number) {
//     if (val > 0) {
//       this._price = val;

//       return;
//     }

//     throw new Error("不正な値です。0以下は設定できません。");
//   }

//   @Log3
//   getPriceWithTax(@Log4 tax: number) {
//     return this._price * (1 + tax);
//   }
// }
