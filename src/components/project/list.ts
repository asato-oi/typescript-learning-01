import { Component } from "../base";
import { ProjectItem } from "./item";
import { autoBind } from "../decorators/autobind";
import { DragTarget } from "../model/drag-drop";
import { Project, ProjectStatus } from "../model/project";
import { projectState } from "../state/project-state";

export class ProjectList
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
