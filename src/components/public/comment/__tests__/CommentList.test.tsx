import { render, screen } from '@testing-library/react';
import CommentList from '../CommentList';

const mockComments = [
  {
    id: '1',
    content: '這是第一則評論',
    author: '張三',
    createdAt: '2024-01-15T10:00:00Z',
    replies: [],
  },
  {
    id: '2',
    content: '這是第二則評論',
    author: '李四',
    createdAt: '2024-01-16T10:00:00Z',
    replies: [
      {
        id: '3',
        content: '這是第一層回覆',
        author: '王五',
        createdAt: '2024-01-16T11:00:00Z',
        replies: [
          {
            id: '4',
            content: '這是第二層回覆',
            author: '趙六',
            createdAt: '2024-01-16T12:00:00Z',
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: '5',
    content: '這是第三則評論',
    author: '錢七',
    createdAt: '2024-01-17T10:00:00Z',
    replies: [],
  },
];

describe('CommentList', () => {
  it('應該渲染頂層評論列表', () => {
    render(<CommentList comments={mockComments} />);
    
    expect(screen.getByText('這是第一則評論')).toBeInTheDocument();
    expect(screen.getByText('這是第二則評論')).toBeInTheDocument();
    expect(screen.getByText('這是第三則評論')).toBeInTheDocument();
  });

  it('應該顯示評論作者', () => {
    render(<CommentList comments={mockComments} />);
    
    expect(screen.getByText('張三')).toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
    expect(screen.getByText('錢七')).toBeInTheDocument();
  });

  it('應該顯示巢狀 replies', () => {
    render(<CommentList comments={mockComments} />);
    
    expect(screen.getByText('這是第一層回覆')).toBeInTheDocument();
    expect(screen.getByText('王五')).toBeInTheDocument();
  });

  it('應該顯示多層巢狀 replies', () => {
    render(<CommentList comments={mockComments} />);
    
    expect(screen.getByText('這是第二層回覆')).toBeInTheDocument();
    expect(screen.getByText('趙六')).toBeInTheDocument();
  });

  it('replies 應該有縮排樣式', () => {
    const { container } = render(<CommentList comments={mockComments} />);
    
    // 找到第一層回覆的容器
    const replyContent = screen.getByText('這是第一層回覆');
    const replyContainer = replyContent.closest('[class*="ml-"]') || replyContent.closest('[class*="pl-"]');
    
    expect(replyContainer).toBeInTheDocument();
  });

  it('空列表應該顯示提示訊息', () => {
    render(<CommentList comments={[]} />);
    
    expect(screen.getByText(/尚無評論/i)).toBeInTheDocument();
  });

  it('空列表不應該顯示評論項目', () => {
    render(<CommentList comments={[]} />);
    
    expect(screen.queryByText('張三')).toBeNull();
    expect(screen.queryByText('李四')).toBeNull();
  });

  it('應該顯示評論時間', () => {
    render(<CommentList comments={mockComments} />);
    
    // 應該有顯示時間的元素（格式可能是相對時間或絕對時間）
    const timeElements = screen.getAllByText(/2024|分鐘前|小時前|天前/i);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('沒有 replies 的評論不應該渲染 replies 區域', () => {
    const singleComment = [mockComments[0]]; // 沒有 replies
    const { container } = render(<CommentList comments={singleComment} />);
    
    // 確認只有一個評論內容
    expect(screen.getByText('這是第一則評論')).toBeInTheDocument();
    expect(screen.queryByText('這是第一層回覆')).toBeNull();
  });

  it('應該按照評論順序渲染', () => {
    const { container } = render(<CommentList comments={mockComments} />);
    
    const allText = container.textContent || '';
    const firstIndex = allText.indexOf('這是第一則評論');
    const secondIndex = allText.indexOf('這是第二則評論');
    const thirdIndex = allText.indexOf('這是第三則評論');
    
    expect(firstIndex).toBeGreaterThan(-1);
    expect(secondIndex).toBeGreaterThan(-1);
    expect(thirdIndex).toBeGreaterThan(-1);
    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });
});
