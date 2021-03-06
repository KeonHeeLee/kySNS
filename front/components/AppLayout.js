import React, { useEffect } from 'react';
import { Menu, Input, Row, Col} from 'antd';
import Link from 'next/link'
import PropTypes from 'prop-types';
import Router from 'next/router';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';
import { useSelector, useDispatch } from 'react-redux';


const AppLayout = ({ children }) => {
  const { me } = useSelector(state => state.user);

  const onSearch = (value) => {
    Router.push({ pathname: '/hashtag', query: {tag: value} }, `/hashtag/${value}`);
  };

  return (
    <div>
      <Menu mode="horizontal">
        <Menu.Item key="home"><Link href="/"><a>ホームページ</a></Link></Menu.Item>
        <Menu.Item key="profile"><Link href="/profile"><a>プロフィール</a></Link></Menu.Item>
          <Menu.Item key="mail">
            <Input.Search 
              enterButton 
              style={{ verticalAlign : 'middle' }}
              onSearch={onSearch}
            />
        </Menu.Item>
      </Menu>
      <Row gutter={10} >
        <Col xs={24} md={6} >
          { me 
          ? <UserProfile />
          : <LoginForm />
        }   
        </Col> 
        <Col xs={24} md={12} >
          {children}
        </Col>
        <Col xs={24} md={6} >
          <Link href="https://github.com/KeonYoungLeee/React-nodebird" prefetch={false} ><a target="_blank">Made by LEEKY</a></Link>
        </Col>
      </Row>
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AppLayout;