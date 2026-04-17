export interface ApiComment {
  id:            string;
  content:       string;
  rating:        number;
  createdAt:     string;
  userId:        string;
  realEstateId:  string;
  user: {
    name:  string;
    image: string | null;
  };
}

export interface CreateCommentDto {
  realEstateId: string;
  content:      string;
  rating:       number;
}