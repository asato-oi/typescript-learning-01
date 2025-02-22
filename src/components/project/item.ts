import { Component } from "../base";
import { autoBind } from "../decorators/autobind";
import { Draggable } from "../model/drag-drop";
import { Project } from "../model/project";

export class ProjectItem
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
