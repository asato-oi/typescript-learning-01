export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateClassName: string,
    hostClassName: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.querySelector(templateClassName)!;
    this.hostElement = document.querySelector(hostClassName)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  protected abstract configure(): void;

  protected abstract renderContent(): void;

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }
}
