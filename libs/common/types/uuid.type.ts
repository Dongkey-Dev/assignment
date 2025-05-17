import { v1 as uuidv1 } from 'uuid';
import { z } from 'zod';

export const uuidSchema = z.custom<T_UUID>().transform((v) => {
  if (v instanceof T_UUID) return v;
  return new T_UUID(v);
});

export type IUUIDTransable = string | Buffer | T_UUID;
export class T_UUID {
  private uuid!: Buffer;
  private identifier?: string;
  constructor(input?: IUUIDTransable) {
    if (input == undefined) {
      this.fromString(uuidv1());
    } else if (typeof input == 'string') {
      this.fromString(input);
    } else if (input instanceof T_UUID) {
      this.fromBuffer(input.exportBuffer());
    } else if (input instanceof Buffer) {
      this.fromBuffer(input);
    } else this.fromBuffer(input);
  }

  exportString(): string {
    return this.uuid.toString('hex');
  }

  exportBuffer(): Buffer {
    return Buffer.from(this.uuid);
  }

  exportFormattedString(): string {
    return `${this.uuid.toString('hex', 0, 4)}-${this.uuid.toString('hex', 4, 6)}-${this.uuid.toString(
      'hex',
      6,
      8,
    )}-${this.uuid.toString('hex', 8, 10)}-${this.uuid.toString('hex', 10, 16)}`;
  }
  fromString(text: string) {
    let madenBuffer: Buffer;
    madenBuffer = Buffer.from(text.replace(/-/g, ''), 'hex');
    if (madenBuffer.length === 0) {
      const base64Encoded = Buffer.from(text).toString('base64');
      madenBuffer = Buffer.from(base64Encoded, 'base64');
    }
    const paddedBuffer = Buffer.alloc(16);
    madenBuffer.copy(paddedBuffer, 0, 0, Math.min(madenBuffer.length, 16));
    this.fromBuffer(paddedBuffer);
  }

  fromBuffer(buffer: Buffer) {
    this.uuid = buffer;
    this.identifier = this.makeRandomIdentifier(this.exportBuffer());
  }

  makeRandomIdentifier(payload: Buffer): string {
    const base64String = payload.toString('base64');
    const decimalString = BigInt(
      '0x' + Buffer.from(base64String, 'base64').toString('hex'),
    ).toString(10);
    const index = parseInt(decimalString.slice(0, 8), 10) % resource.length;

    this.identifier = resource[index];
    return this.identifier;
  }

  compareWith(destination: IUUIDTransable) {
    const destUUID = new T_UUID(destination);
    return Buffer.compare(this.uuid, destUUID.exportBuffer());
  }

  isEqual(destination: IUUIDTransable) {
    return this.compareWith(destination) === 0;
  }

  static ensureFormattedString(transable: IUUIDTransable): string {
    return new T_UUID(transable).exportFormattedString();
  }
  static ensureBuffer(transable: IUUIDTransable): Buffer {
    return new T_UUID(transable).exportBuffer();
  }
  static ensureString(transable: IUUIDTransable): string {
    return new T_UUID(transable).exportString();
  }
}

/* eslint-disable prettier/prettier */
const resource = [
  '사랑',
  '행복',
  '기쁨',
  '슬픔',
  '분노',
  '희망',
  '절망',
  '용기',
  '두려움',
  '평화',
  '전쟁',
  '자유',
  '속박',
  '성공',
  '실패',
  '노력',
  '게으름',
  '지혜',
  '어리석음',
  '친구',
  '적',
  '가족',
  '연인',
  '결혼',
  '이혼',
  '출생',
  '죽음',
  '삶',
  '꿈',
  '현실',
  '미래',
  '과거',
  '현재',
  '시간',
  '공간',
  '우주',
  '별',
  '달',
  '해',
  '바다',
  '산',
  '강',
  '숲',
  '나무',
  '꽃',
  '동물',
  '사람',
  '아이',
  '어른',
  '노인',
  '남자',
  '여자',
  '미움',
  '질투',
  '존경',
  '멸시',
  '자신감',
  '열등감',
  '자존심',
  '겸손',
  '교만',
  '용서',
  '복수',
  '기억',
  '망각',
  '지식',
  '무지',
  '진실',
  '거짓',
  '정의',
  '불의',
  '평등',
  '차별',
  '자연',
  '인공',
  '예술',
  '과학',
  '문학',
  '음악',
  '그림',
  '춤',
  '연극',
  '영화',
  '사진',
  '기술',
  '발명',
  '발견',
  '여행',
  '모험',
  '위험',
  '안전',
  '건강',
  '질병',
  '의사',
  '환자',
  '약',
  '치료',
  '교육',
  '학교',
  '선생님',
  '학생',
  '공부',
  '시험',
  '성적',
  '졸업',
  '취업',
  '직업',
  '회사',
  '직장',
  '상사',
  '부하',
  '동료',
  '경쟁',
  '협력',
  '성장',
  '퇴보',
  '발전',
  '퇴화',
  '기대',
  '실망',
  '불행',
];
