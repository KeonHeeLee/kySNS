import React, { useState, useCallback, useEffect } from 'react';
import { Card, Icon, Button, Avatar, Form, Input, List, Comment, Popover } from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { ADD_COMMENT_REQUEST, LOAD_COMMENTS_REQUEST, UNLIKE_POST_REQUEST, LIKE_POST_REQUEST, RETWEET_REQUEST, REMOVE_POST_REQUEST } from '../reducers/post';
import PostImages from './PostImages';
import PostCardContent from './PostCardContent'
import { FOLLOW_USER_REQUEST, UNFOLLOW_USER_REQUEST } from '../reducers/user';
import styled from 'styled-components';

export const CardWrapper = styled.div`
  margin-bottom: 20px;
`;

const PostCard = ({post}) => {

  const [commentFormOpened, setCommentFormOpened] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { me } = useSelector(state => state.user);
  const { commentAdded, isAddingComment } = useSelector(state => state.post);
  const dispatch = useDispatch();

  const liked = me && post.Likers && post.Likers.find(v => v.id === me.id);

  const onToggleComment = useCallback(() => {
    setCommentFormOpened(prev => !prev);
    if (!commentFormOpened) {
      dispatch({
        type: LOAD_COMMENTS_REQUEST,
        data: post.id,
      });
    }
  }, [commentFormOpened]);
  
  const onSubmitComment = useCallback((e) => {
    e.preventDefault();
    if (!me) {
      return alert('ログインが必要です。');
    };
    dispatch({
      type: ADD_COMMENT_REQUEST,
      data: {
        postId: post.id,
        content: commentText,
      }
    })
    
  }, [me && me.id, commentText]);

  useEffect(() => {
    if (commentAdded) {
      setCommentText('');
    }
  }, [commentAdded]);

  const onChangeCommentText = useCallback((e) => {
    setCommentText(e.target.value);
  }, []);

  const onToggleLike = useCallback(() => {
    if (!me) {
      return alert('ログインが必要です。');
    }
    if (liked) {
      dispatch({
        type: UNLIKE_POST_REQUEST,
        data: post.id,
      });
    } else {
      dispatch({
        type: LIKE_POST_REQUEST,
        data: post.id,
      });
    }
  }, [me && me.id, post && post.id, liked]);

  const onRetweet = useCallback(() => {
    if (!me) {
      return alert('ログインが必要です。');
    }
    return dispatch({
      type: RETWEET_REQUEST,
      data: post.id,
    });
  }, [me && me.id, post && post.id]);

  const onFollow = useCallback(userId => () => {
    dispatch({
      type: FOLLOW_USER_REQUEST,
      data: userId,
    });
  }, []);

  const onUnfollow = useCallback(userId => () => {
    dispatch({
      type: UNFOLLOW_USER_REQUEST,
      data: userId,
    });
  }, []);

  const onRemovePost = useCallback(userId => () => {
    dispatch({
      type: REMOVE_POST_REQUEST,
      data: userId,
    });
  }, []);

  return (
    <CardWrapper>
      <Card
        cover={post.Images && post.Images[0] && <PostImages images={post.Images} />}
        actions={[
          <Icon type="retweet" key="retweet" onClick={onRetweet} />,
          <Icon
            type="heart"
            key="heart"
            theme={liked ? 'twoTone' : 'outlined'}
            twoToneColor="#eb2f96"
            onClick={onToggleLike}
          />,
          <Icon type="message" key="message" onClick={onToggleComment} />,
          <Popover
            key="ellipsis"
            content={(
              <Button.Group>
                {me && post.UserId === me.id
                  ? (
                    <>
                      <Button>修正</Button>
                      <Button type="danger" onClick={onRemovePost(post.id)}>削除</Button>
                    </>
                  )
                  : <Button>通報する</Button>}
              </Button.Group>
            )}
          >
            <Icon type="ellipsis" />,
          </Popover>
        ]}
        title={post.RetweetId ? `${post.User.nickname}様がリツイートしました。` : null}
        extra={!me || post.User.id === me.id
          ? null
          : me.Followings && me.Followings.find(v => v.id === post.User.id)
            ? <Button onClick={onUnfollow(post.User.id)}>アンフォロー</Button>
            : <Button onClick={onFollow(post.User.id)}>フォロー</Button>
        }
      >
        {post.RetweetId && post.Retweet
          ? (
            <Card
              cover={post.Retweet.Images[0] && <PostImages images={post.Retweet.Images} />}
            >
              <Card.Meta
                avatar={(
                  <Link
                    href={{ pathname: '/user', query: { id: post.Retweet.User.id } }}
                    as={`/user/${post.Retweet.User.id}`}
                  >
                    <a><Avatar>{post.Retweet.User.nickname[0]}</Avatar></a>
                  </Link>
                )}
                title={post.Retweet.User.nickname}
                description={<PostCardContent postData={post.Retweet.content} />}
              />
            </Card>
          )
          : (
            <Card.Meta
              avatar={(
                <Link href={{ pathname: '/user', query: { id: post.User.id } }} as={`/user/${post.User.id}`}>
                  <a><Avatar>{post.User.nickname[0]}</Avatar></a>
                </Link>
              )}
              title={post.User.nickname}
              description={<PostCardContent postData={post.content} />} 
            />
          )}
      </Card>
      {commentFormOpened && (
        <>
          <Form onSubmit={onSubmitComment}>
            <Form.Item>
              <Input.TextArea rows={4} value={commentText} onChange={onChangeCommentText}/>
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={isAddingComment}>クリック</Button>
          </Form>
          <List
            header={`${post.Comments ? post.Comments.length : 0} コメント`}
            itemLayout="horizontal"
            dataSource={post.Comments || []}
            renderItem={ item => (
              <li>
                <Comment
                  author={item.User.nickname}
                  avatar={(
                    <Link href={{ pathname: '/user', query: { id: item.User.id } }} as={`/user/${item.User.id}`}>
                      <a><Avatar>{item.User.nickname[0]}</Avatar></a>
                    </Link>
                  )}
                  content={item.content}
                />
              </li>
            )}
          />
        </>
      )} 
    </CardWrapper>
  )
};

PostCard.prototypes = {
  post: PropTypes.shape({
    User : PropTypes.object,
    content : PropTypes.string,
    img: PropTypes.string,
    createdAt: PropTypes.object,  
  }),
}

export default PostCard;

