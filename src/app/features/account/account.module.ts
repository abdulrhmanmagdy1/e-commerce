import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountRoutingModule } from './account-routing.module';
import { AccountShellComponent } from './account-shell.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@NgModule({
  declarations: [AccountShellComponent],
  imports: [CommonModule, RouterModule, AccountRoutingModule, TranslatePipe]
})
export class AccountModule {}
