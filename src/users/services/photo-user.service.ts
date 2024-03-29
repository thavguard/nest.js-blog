import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { PhotoUserEntity } from "../entities/photo-user.entity";
import { User } from "../entities/user.entity";

@Injectable()
export class PhotoUserService {
  constructor(
    @InjectRepository(PhotoUserEntity)
    private readonly PhotoUserRepository: Repository<PhotoUserEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async canManage(userId: number, photoId: number): Promise<boolean> {
    const photo = await this.findOneById(photoId);

    if (!photo) throw new NotFoundException();

    return photo.user.id === userId;
  }

  async findOneById(photoId: number): Promise<PhotoUserEntity> {
    return this.PhotoUserRepository.findOneBy({ id: photoId });
  }

  async findByUserId(id: number): Promise<PhotoUserEntity[]> {
    const user = await this.userRepository.findOneBy({ id });

    console.log({ user });

    const photos = await this.PhotoUserRepository.find({
      where: { user: { id: user.id } },
      relations: { user: true },
    });

    console.log("photos");
    console.log({ photos });

    return photos;
  }

  async addPhoto(
    userId: number,
    file: Express.Multer.File
  ): Promise<PhotoUserEntity> {
    const user = await this.userRepository.findOneBy({ id: userId });

    const photo = this.PhotoUserRepository.create({
      user,
      filename: file.filename,
    });
    const savedPhoto = await this.PhotoUserRepository.save(photo);

    return savedPhoto;
  }

  async addPhotos(
    userId: number,
    files: Express.Multer.File[]
  ): Promise<PhotoUserEntity[]> {
    const promises = files.map((file) => this.addPhoto(userId, file));

    return await Promise.all(promises);
  }

  async removePhoto(userId: number, photoId: number): Promise<DeleteResult> {
    const user = await this.userRepository.findOneBy({ id: userId });
    return this.PhotoUserRepository.delete({ user, id: photoId });
  }
}
