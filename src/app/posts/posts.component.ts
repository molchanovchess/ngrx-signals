import {Component, computed, inject, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {PostsService} from "./services/posts.service";
import {patchState, signalState, signalStore, withComputed, withHooks, withMethods, withState} from "@ngrx/signals";
import {PostInterface} from "./types/post.interface";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {pipe, switchMap, tap} from "rxjs";

export interface PostsStateInterface {
  posts: PostInterface[];
  isLoading: boolean;
  error: string | null;
}

export const PostsStore = signalStore(
  withState<PostsStateInterface>({
      posts: [],
      error: null,
      isLoading: false,
  }),
  withComputed((store) => ({
    postsCount: computed(() => store.posts().length),
  })),
  withMethods((store, postsService = inject(PostsService)) => ({
    addPost(title: string) {
        const newPost: PostInterface = {
          id: crypto.randomUUID(),
          title,
        };
        const updatedPosts = [...store.posts(), newPost];
        patchState(store, {posts: updatedPosts});
    },
    removePost(id: string) {
        const updatedPosts = store.posts().filter(post => post.id !== id);
        patchState(store, {posts: updatedPosts});
    },
    addPosts(posts: PostInterface[]) {
      patchState(store, {posts});
    },
    loadPosts: rxMethod<void>(
      pipe(
        switchMap(() => {
          return postsService.getPosts().pipe(
            tap((posts) => {
              patchState(store, {posts});
          }))
        })
      )
    )
  })),
  withHooks({
    onInit(store) {
      store.loadPosts();
    }
  })
);

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss',
  providers: [PostsStore]
})
export class PostsComponent{
  fb = inject(FormBuilder);
  postsService = inject(PostsService);
  store = inject(PostsStore);
  addForm = this.fb.nonNullable.group({
    title: '',
  });
  // state = signalState<PostsStateInterface>({
  //   posts: [],
  //   error: null,
  //   isLoading: false,
  // });
  // onAdd(): void {
  //   const newPost: PostInterface = {
  //     id: crypto.randomUUID(),
  //     title: this.addForm.getRawValue().title,
  //   };
  //   const updatedPosts = [...this.state.posts(), newPost];
  //   patchState(this.state, (state) => ({...state, posts: updatedPosts}));
  //   this.addForm.reset();
  // }
  // removePost(id: string): void {
  //   const updatedPosts = this.state.posts().filter(post => post.id !== id);
  //   patchState(this.state, (state) => ({...state, posts: updatedPosts}));
  // }

  // ngOnInit() {
  //   this.postsService.getPosts().subscribe(posts => {
  //     this.store.addPosts(posts);
  //   })
  // }

  onAdd(): void {
    this.store.addPost(this.addForm.getRawValue().title);
    this.addForm.reset();
  }
}
