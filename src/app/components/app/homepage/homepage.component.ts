import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { StoryDialogComponent } from './Stores-Dialog/stories.component';
import { NgForOf, NgIf } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { AlertDialogComponent } from "./alert/alert.component";
import { title } from "process";

interface Story {
  id: number;
  profilePicture: string;
  storyText: string;
  flag: boolean;
  relatedStories: Story[];
}

interface Comment {
  username: string;
  text: string;
}

interface User {
  username: string;
  profilePicture: string;
  stories: Story[];
}

interface Post {
  id: number; // Added ID to differentiate posts
  image: string;
  caption: string;
  showCommentBox: boolean;
  newComment: string;
  comments: Comment[];
}

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.scss"],
  imports: [FormsModule, NgForOf, NgIf],
  standalone: true
})
export class HomePageComponent implements OnInit {
  keyword: string = 'special'; // Define the keyword to check for
  currentUserProfilePicture: string = 'https://via.placeholder.com/80?text=UserProfile'; // Default profile picture
  currentUserName: string = 'John Doe'; // Default user name
  currentUser!: User; // Ensure currentUser is always initialized
  allUsers: User[] = []; // Store all users

  posts: Post[] = []; // Define and initialize posts
  stories: Story[] = []; // Define and initialize stories

  defaultStories: Story[] = [
    { id: 1, profilePicture: 'https://via.placeholder.com/80?text=1', storyText: '', flag: false, relatedStories: [] },
    { id: 2, profilePicture: 'https://via.placeholder.com/80?text=2', storyText: '', flag: false, relatedStories: [] },
    { id: 3, profilePicture: 'https://via.placeholder.com/80?text=3', storyText: '', flag: false, relatedStories: [] }
  ]; // Default stories

  defaultPosts: Post[] = [
    { id: 1, image: 'https://via.placeholder.com/600x400?text=Post+1', caption: 'Beautiful sunset!', showCommentBox: false, newComment: '', comments: [] },
    { id: 2, image: 'https://via.placeholder.com/600x400?text=Post+2', caption: 'Amazing day at the beach!', showCommentBox: false, newComment: '', comments: [] }
  ]; // Default posts

  constructor(private dialog: MatDialog, private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Retrieve username from query parameters
    this.activatedRoute.queryParams.subscribe(params => {
      this.currentUserName = params['username'] || this.currentUserName;
    });

    // Load user data from localStorage
    this.loadUserData();

    // If the user does not exist, create a new one
    if (!this.currentUser) {
      this.createNewUser();
    }

    // Set posts and stories based on the current user
    this.posts = this.getAllPosts(); // Fetch all posts to be shared among users
    this.stories = this.getAllStories(); // Fetch all stories to be shared among users

    // Save all users back to localStorage
    this.saveUserData();
  }

  loadUserData(): void {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.allUsers = JSON.parse(storedUsers);
      this.currentUser = this.allUsers.find(user => user.username === this.currentUserName) ?? this.createNewUser();
    } else {
      // If no users are stored, create a new one
      this.createNewUser();
    }
  }

  createNewUser(): User {
    const newUser: User = {
      username: this.currentUserName,
      profilePicture: this.currentUserProfilePicture,
      stories: [...this.getAllStories()] // Initialize with all stories
    };

    this.allUsers.push(newUser);
    this.currentUser = newUser;
    return newUser;
  }

  getAllPosts(): Post[] {
    // Ensure posts are shared among all users
    const storedPosts = localStorage.getItem('posts');
    if (!storedPosts) {
      localStorage.setItem('posts', JSON.stringify(this.defaultPosts));
      return this.defaultPosts;
    }
    return JSON.parse(storedPosts);
  }

  getAllStories(): Story[] {
    // Ensure stories are shared among all users
    const storedStories = localStorage.getItem('stories');
    if (!storedStories) {
      localStorage.setItem('stories', JSON.stringify(this.defaultStories));
      return this.defaultStories;
    }
    return JSON.parse(storedStories);
  }

  saveUserData(): void {
    localStorage.setItem('users', JSON.stringify(this.allUsers));
    localStorage.setItem('posts', JSON.stringify(this.posts)); // Save updated posts
    localStorage.setItem('stories', JSON.stringify(this.stories)); // Save updated stories
  }

  openStory(story: Story): void {
    this.dialog.open(StoryDialogComponent, {
      width: '400px',
      data: { story }
    });
  }

  toggleCommentBox(post: Post): void {
    post.showCommentBox = !post.showCommentBox;
  }

  addComment(post: Post, commentText: string): void {
    if (commentText.trim()) {
      const newComment: Comment = {
        username: this.currentUserName, // Use the current username
        text: commentText.trim()
      };

      // Add the comment to the correct post
      const existingPost = this.posts.find(p => p.id === post.id);
      if (existingPost) {
     

        // Check if the comment contains the keyword
        if (commentText.includes(this.keyword)) {
       
         let title = "Violation Error"
         let message = "You have entered a abusive word ;There will be action take on u!!!!!"
          this.dialog.open(AlertDialogComponent, {
            width: '300px',
            data: { title, message }
          });



          const newSpecialStory: Story = {
            id: this.stories.length + 1,
            profilePicture: this.currentUserProfilePicture,
            storyText: `<strong>${newComment.username}</strong> commented with the keyword: "${commentText}" on post: "${post.caption}"`,
            flag: true,
            relatedStories: []
          };

          this.stories.push(newSpecialStory); // Add the special story to all stories

          // Update the related stories for the third story if available
          if (this.stories.length >= 3) {
            this.stories[2].relatedStories.push(newSpecialStory);
          }

          // Also update the current user's stories
          this.currentUser.stories = [...this.stories];
        }
        else
        {
          existingPost.comments.push(newComment);
        }

        post.newComment = '';
        post.showCommentBox = false;
        this.saveUserData(); // Save updated user data
      }
    }
  }

  onLogout(): void {
  //  localStorage.clear();
    this.router.navigate(['/login']);
  }
}
