import { render, screen, waitFor } from '@testing-library/react';
import CommentSection from '../CommentSection';

// Mock fetch globally
global.fetch = jest.fn();

// Mock CommentList
jest.mock('../CommentList', () => {
  return function MockCommentList({ comments }: { comments: any[] }) {
    return <div data-testid="comment-list">CommentList with {comments.length} comments</div>;
  };
});

// Mock CommentForm (假設未來會實作)
jest.mock('../CommentForm', () => {
  return function MockCommentForm() {
    return <div data-testid="comment-form">CommentForm</div>;
  };
});

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
        content: '這是回覆',
        author: '王五',
        createdAt: '2024-01-16T11:00:00Z',
        replies: [],
      },
    ],
  },
];

describe('CommentSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該顯示 loading 狀態', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // 永遠不 resolve
    );

    render(<CommentSection postId="post-123" />);
    expect(screen.getByText(/載入中|Loading/i)).toBeInTheDocument();
  });

  it('應該從 API 載入評論', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comments: mockComments,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalComments: 2,
        },
      }),
    });

    render(<CommentSection postId="post-123" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/posts/post-123/comments?page=1&limit=10');
    });
  });

  it('應該顯示評論數標題', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comments: mockComments,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalComments: 2,
        },
      }),
    });

    render(<CommentSection postId="post-123" />);

    await waitFor(() => {
      expect(screen.getByText(/2 則評論/i)).toBeInTheDocument();
    });
  });

  it('應該顯示單數評論數標題', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comments: [mockComments[0]],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalComments: 1,
        },
      }),
    });

    render(<CommentSection postId="post-123" />);

    await waitFor(() => {
      expect(screen.getByText(/1 則評論/i)).toBeInTheDocument();
    });
  });

  it('載入成功後應該渲染 CommentList', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comments: mockComments,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalComments: 2,
        },
      }),
    });

    render(<CommentSection postId="post-123" />);

    await waitFor(() => {
      expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    });
  });

  it('載入成功後應該渲染 CommentForm', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comments: mockComments,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalComments: 2,
        },
      }),
    });

    render(<CommentSection postId="post-123" />);

    await waitFor(() => {
      expect(screen.getByTestId('comment-form')).toBeInTheDocument();
    });
  });

  it('應該顯示錯誤狀態', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<CommentSection postId="post-123" />);

    await waitFor(() => {
      expect(screen.getByText(/載入評論失敗|錯誤/i)).toBeInTheDocument();
    });
  });

  it('API 回傳錯誤時應該顯示錯誤狀態', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<CommentSection postId="post-123" />);

    await waitFor(() => {
      expect(screen.getByText(/載入評論失敗|錯誤/i)).toBeInTheDocument();
    });
  });

  it('沒有評論時應該顯示 0 則評論', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comments: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalComments: 0,
        },
      }),
    });

    render(<CommentSection postId="post-123" />);

    await waitFor(() => {
      expect(screen.getByText(/0 則評論/i)).toBeInTheDocument();
    });
  });

  it('postId 改變時應該重新載入評論', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comments: mockComments,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalComments: 2,
        },
      }),
    });

    const { rerender } = render(<CommentSection postId="post-123" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/posts/post-123/comments?page=1&limit=10');
    });

    rerender(<CommentSection postId="post-456" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/posts/post-456/comments?page=1&limit=10');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  // 分頁載入測試
  describe('分頁載入', () => {
    const generateComments = (count: number, startId: number = 1) => {
      return Array.from({ length: count }, (_, i) => ({
        id: String(startId + i),
        content: '評論 ' + (startId + i),
        author: '作者 ' + (startId + i),
        createdAt: `2024-01-${String(startId + i).padStart(2, '0')}T10:00:00Z`,
        replies: [],
      }));
    };

    it('應該初始載入 10 則評論', async () => {
      const page1Comments = generateComments(10, 1);
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          comments: page1Comments,
          pagination: {
            currentPage: 1,
            totalPages: 2,
            totalComments: 20,
          },
        }),
      });

      render(<CommentSection postId="post-123" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/posts/post-123/comments?page=1&limit=10');
      });

      await waitFor(() => {
        expect(screen.getByText('CommentList with 10 comments')).toBeInTheDocument();
      });
    });

    it('應該顯示「載入更多」按鈕當有更多頁面時', async () => {
      const page1Comments = generateComments(10, 1);
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          comments: page1Comments,
          pagination: {
            currentPage: 1,
            totalPages: 2,
            totalComments: 20,
          },
        }),
      });

      render(<CommentSection postId="post-123" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /載入更多/i })).toBeInTheDocument();
      });
    });

    it('點擊「載入更多」應該載入第 2 頁並累加評論', async () => {
      const page1Comments = generateComments(10, 1);
      const page2Comments = generateComments(10, 11);
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            comments: page1Comments,
            pagination: {
              currentPage: 1,
              totalPages: 2,
              totalComments: 20,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            comments: page2Comments,
            pagination: {
              currentPage: 2,
              totalPages: 2,
              totalComments: 20,
            },
          }),
        });

      render(<CommentSection postId="post-123" />);

      await waitFor(() => {
        expect(screen.getByText('CommentList with 10 comments')).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByRole('button', { name: /載入更多/i });
      loadMoreButton.click();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/posts/post-123/comments?page=2&limit=10');
      });

      await waitFor(() => {
        expect(screen.getByText('CommentList with 20 comments')).toBeInTheDocument();
      });
    });

    it('全部載入後應該隱藏「載入更多」按鈕', async () => {
      const page1Comments = generateComments(10, 1);
      const page2Comments = generateComments(10, 11);
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            comments: page1Comments,
            pagination: {
              currentPage: 1,
              totalPages: 2,
              totalComments: 20,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            comments: page2Comments,
            pagination: {
              currentPage: 2,
              totalPages: 2,
              totalComments: 20,
            },
          }),
        });

      render(<CommentSection postId="post-123" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /載入更多/i })).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByRole('button', { name: /載入更多/i });
      loadMoreButton.click();

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /載入更多/i })).not.toBeInTheDocument();
      });
    });

    it('載入更多時按鈕應該顯示「載入中...」並 disabled', async () => {
      const page1Comments = generateComments(10, 1);
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          comments: page1Comments,
          pagination: {
            currentPage: 1,
            totalPages: 2,
            totalComments: 20,
          },
        }),
      });

      render(<CommentSection postId="post-123" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /載入更多/i })).toBeInTheDocument();
      });

      // Mock 延遲回應
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                comments: generateComments(10, 11),
                pagination: {
                  currentPage: 2,
                  totalPages: 2,
                  totalComments: 20,
                },
              }),
            });
          }, 100);
        })
      );

      const loadMoreButton = screen.getByRole('button', { name: /載入更多/i });
      loadMoreButton.click();

      // 檢查按鈕狀態
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /載入中/i });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
      });
    });

    it('只有一頁時不應該顯示「載入更多」按鈕', async () => {
      const page1Comments = generateComments(5, 1);
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          comments: page1Comments,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalComments: 5,
          },
        }),
      });

      render(<CommentSection postId="post-123" />);

      await waitFor(() => {
        expect(screen.getByText('CommentList with 5 comments')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /載入更多/i })).not.toBeInTheDocument();
    });
  });
});
