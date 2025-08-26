import './home.scss';

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { REDIRECT_URL, getLoginUrl } from 'app/shared/util/url-utils';
import { useAppSelector } from 'app/config/store';
import { Typography } from '@mui/material';
import Grid from '@mui/system/Grid';
import { Card, CardContent, CardActions, Button, Box } from '@mui/material';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);
  const pageLocation = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectURL = localStorage.getItem(REDIRECT_URL);
    if (redirectURL) {
      localStorage.removeItem(REDIRECT_URL);
      location.href = `${location.origin}${redirectURL}`;
    }
  });
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axios
      .get('/api/news')
      .then(response => {
        setArticles(response.data);
      })
      .catch(error => console.error('Error fetching news:', error));
  }, []);
  return (
    <>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            mb: 3,
            mt: 5,
            position: 'relative',
            display: 'inline-block',
            '&:after': {
              content: '""',
              position: 'absolute',
              width: '50%',
              height: '4px',
              bottom: '-8px',
              left: '25%',
              backgroundColor: 'secondary.main',
              borderRadius: '2px',
            },
          }}
        >
          Latest News
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        {Array.isArray(articles) &&
          articles.map((article, index) => (
            <Grid key={index} size={{ xs: 4, sm: 4, md: 6 }}>
              <Card
                sx={{
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                  minHeight: 300,
                  maxHeight: 400,
                }}
              >
                <CardContent>
                  <Typography variant="h5" component="div">
                    {article.title}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>{new Date(article.publishedDate).toLocaleString()}</Typography>
                  <Typography
                    component="div"
                    dangerouslySetInnerHTML={{ __html: article.description }}
                    sx={{
                      '& p': {
                        margin: 0,
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                      '& a': { color: 'primary.main' },
                    }}
                  />
                </CardContent>
                <CardActions>
                  <Button size="small" href={article.link} variant="contained" color="secondary" sx={{ textTransform: 'none' }}>
                    Read More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>
    </>
  );
};
