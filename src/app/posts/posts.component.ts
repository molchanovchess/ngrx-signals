import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {PostsService} from "./services/posts.service";
import {patchState, signalState} from "@ngrx/signals";
import {PostInterface} from "./types/post.interface";

export interface PostsStateInterface {
  posts: PostInterface[];
  isLoading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent {
  fb = inject(FormBuilder);
  postsService = inject(PostsService);
  addForm = this.fb.nonNullable.group({
    title: '',
  });
  state = signalState<PostsStateInterface>({
    posts: [],
    error: null,
    isLoading: false,
  });
  onAdd(): void {
    const newPost: PostInterface = {
      id: crypto.randomUUID(),
      title: this.addForm.getRawValue().title,
    };
    const updatedPosts = [...this.state.posts(), newPost];
    patchState(this.state, (state) => ({...state, posts: updatedPosts}));
    this.addForm.reset();
  }
  removePost(id: string): void {
    const updatedPosts = this.state.posts().filter(post => post.id !== id);
    patchState(this.state, (state) => ({...state, posts: updatedPosts}));
  }
}
