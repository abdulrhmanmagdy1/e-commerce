import { Component, effect, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'app-spinner',
    standalone: true,
    imports: [],
    templateUrl: './spinner.component.html',
    styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
    public readonly visible = signal(false);

    constructor(private readonly loading: LoadingService) {
        effect(() => {
            this.visible.set(this.loading.isLoading());
        });
    }
} 