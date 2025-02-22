import { Component } from "../base";
import { Validatable, validate } from "../utility/validation";
import { autoBind } from "../decorators/autobind";
import { projectState } from "../state/project-state";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  manDayInputElement: HTMLInputElement;

  constructor() {
    super(".js-project-form", ".js-app", true);

    this.titleInputElement = this.element.querySelector(".js-project-title")!;
    this.descriptionInputElement = this.element.querySelector(
      ".js-project-description"
    )!;
    this.manDayInputElement = this.element.querySelector(".js-project-manDay")!;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredManDay = this.manDayInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };

    const manDayValidatable: Validatable = {
      value: +enteredManDay,
      required: true,
      min: 1,
      max: 1000,
    };
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(manDayValidatable)
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
      projectState.addProject(title, description, manDay);
      this.clearInputs();
    }
  }
}
