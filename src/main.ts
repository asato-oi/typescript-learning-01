// Drag & Drop
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

/** Project type */
enum ProjectStatus {
  Active,
  Finished,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public manDay: number,
    public status: ProjectStatus
  ) {}
}

/** Project State Management */
type Listener<T> = (items: T[]) => void;

abstract class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, manDay: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      manDay,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => project.id === projectId);

    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      // コピーした配列を渡す
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

/** validate input value */
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }

  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }

  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }

  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

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

/** Component Class */
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get manDay() {
    if (this.project.manDay < 20) {
      return this.project.manDay.toString() + "人日";
    } else {
      return (this.project.manDay / 20).toString() + "人月";
    }
  }

  constructor(hostId: string, project: Project) {
    super(".js-project-item", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(_: DragEvent): void {
    console.log("ドラッグ終了");
  }

  configure(): void {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.manDay;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    super(".js-project-list", ".js-app", false, `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  @autoBind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autoBind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      projectId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autoBind
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure(): void {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        }

        return project.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent(): void {
    const contentId = `${this.type}-content`;
    this.element.querySelector(".js-project-content")!.id = contentId;
    this.element.querySelector(".js-project-head")!.textContent =
      this.type === "active" ? "実行中" : "完了";
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-content`
    )! as HTMLUListElement;

    listEl.innerHTML = "";

    for (const projectItem of this.assignedProjects) {
      new ProjectItem(`#${listEl.id}`, projectItem);
    }
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
