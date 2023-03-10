import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PostEntity } from '../entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreatePostDto } from '../dtos/create-post.dto';
import { UpdatePostDto } from '../dtos/update-post.dto';
import { UserService } from '../../users/users.service';
import { PostPhotosService } from './post-photos.service';
import { Like } from '../entities/like.entity';
import { LikesService } from './likes.service';
import { CommentariesService } from './commentaries.service';
import { Commentary } from '../entities/commentaries.entity';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { UpdateCommentDto } from '../dtos/update-comment.dto';
import { PostPhotoEntity } from '../entities/post-photo.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly usersService: UserService,
    private readonly postPhotosService: PostPhotosService,
    private readonly likeService: LikesService,
    private readonly commentsService: CommentariesService
  ) {
  }

  // Post

  async findAll(): Promise<PostEntity[]> {
    return this.postRepository.find();
  }

  async findPostById(postId: number): Promise<PostEntity> {
    return await this.postRepository.findOne({
      where: { id: postId }
    });
  }

  async findPostsByUserId(userId: number): Promise<PostEntity[]> {
    return this.postRepository.find({ where: { user: { id: userId } } });
  }

  async createPost(
    userId: number,
    createPostDto: CreatePostDto,
    files?: Express.Multer.File[]
  ): Promise<PostEntity> {
    const user = await this.usersService.findOneById(userId);
    const newPost = this.postRepository.create({ user, ...createPostDto });
    const savedPost = await this.postRepository.save(newPost);

    if (files.length) {
      await this.postPhotosService.addPhoto(savedPost.id, files);
    }

    return this.findPostById(savedPost.id);

  }

  async updatePost(
    postId: number,
    updatePostDto: UpdatePostDto,
    files?: Express.Multer.File[]
  ): Promise<UpdateResult> {

    let photos: PostPhotoEntity[] = [];

    if (updatePostDto?.photos) {
      photos = JSON.parse(updatePostDto.photos);
    }

    await this.postPhotosService.updatePhotos(postId, files, photos);

    return this.postRepository.update({
      id: postId
    }, { body: updatePostDto.body, title: updatePostDto.title });
  }

  async removePost(postId: number): Promise<DeleteResult> {
    return this.postRepository.delete(postId)
  }


  // Likes

  async addLike(postId: number, userId: number): Promise<Like> {
    return await this.likeService.addLike(postId, userId);
  }

  async removeLike(postId: number, userId: number): Promise<DeleteResult> {
    return await this.likeService.removeLike(postId, userId);
  }

  // Comments

  async addComment(postId: number, userId: number, createCommentDto: CreateCommentDto): Promise<Commentary> {
    return await this.commentsService.addComment(postId, userId, createCommentDto);
  }

  async updateComment(postId: number, userId: number, commentId: number, updateCommentDto: UpdateCommentDto): Promise<UpdateResult> {
    return await this.commentsService.updateComment(postId, userId, commentId, updateCommentDto);
  }

  async removeComment(postId: number, userId: number, commentId: number): Promise<DeleteResult> {
    return await this.commentsService.removeComment(postId, userId, commentId);
  }


}
