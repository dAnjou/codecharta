import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { ActionIconComponent } from "./actionIcon.component"

@NgModule({
	imports: [CommonModule],
	declarations: [ActionIconComponent],
	exports: [ActionIconComponent],
	entryComponents: [ActionIconComponent]
})
export class ActionIconModule {}
