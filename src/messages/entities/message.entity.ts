import { AbstractEntity } from '../../common/entities/abstract.entity';
import { Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MessageRoomEntity } from './message-room.entity';

export class MessageEntity extends AbstractEntity {
  @Column()
  public message: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  public user: User;

  @ManyToOne(() => MessageRoomEntity, (room) => room.messages, { onDelete: 'CASCADE' })
  public messageRoom: MessageRoomEntity;
}
