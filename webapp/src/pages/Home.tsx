import React from 'react';
import { Box, Card, Grid, Typography} from "@mui/material";
import Item from '../components/Item';
import '@fontsource/roboto';


const Home: React.FC = () => {
  return (
    //<Container fixed>
    <>
      <Box >
        <Grid container>

          <Grid xs={12}>
            <Typography variant="h2">補正インスリン</Typography>
          </Grid>

          {/* 補正インスリン式 */}
          <Grid container xs={12}>

            {/* 左辺 */}
            <Grid container xs={8}>
              {/* 分母 */}
              <Grid container columns={21}>
                <Grid xs={10}>
                  <Item>食前血糖値</Item>
                </Grid>
                <Grid xs={1}>
                  <Item>-</Item>
                </Grid>
                <Grid xs={10}>
                  <Item>目標血糖値</Item>
                </Grid>
              </Grid>           

              <Grid container>
                <Grid xs={12}>
                  <Item>-----</Item>
                </Grid>
              </Grid>           

              <Grid container>
                <Grid xs={12}>
                  <Item>インスリン効果比</Item>
                </Grid>
              </Grid>           
            </Grid>

            {/* =右辺 */}
            <Grid container xs={4}>

              {/* = */}
              <Grid container xs={1}>
                  <Item>=</Item>
              </Grid>

              {/* 右辺 */}
              <Grid container xs={11}>
                <Item>右辺</Item>
              </Grid>

            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Grid container>

          <Grid xs={12}>
           <Typography variant="h2">糖質インスリン</Typography>
          </Grid>

          {/* 補正インスリン式 */}
          <Grid container xs={12}>

            {/* 左辺 */}
            <Grid container xs={8}>

              <Grid container columns={21}>
                <Grid xs={10}>
                  <Item>カーボ数</Item>
                </Grid>
                <Grid xs={1}>
                  <Item>x</Item>
                </Grid>
                <Grid xs={10}>
                  <Item>カーボ比</Item>
                </Grid>
              </Grid>              
            </Grid>

            {/* =右辺 */}
            <Grid container xs={4}>

              {/* = */}
              <Grid container xs={1}>
                  <Item>=</Item>
              </Grid>

              {/* 右辺 */}
              <Grid container xs={11}>
                <Item>右辺</Item>
              </Grid>

            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Grid container>

          <Grid xs={12}>
           <Typography variant="h2">合計インスリン</Typography>
          </Grid>

          {/* 補正インスリン式 */}
          <Grid container xs={12}>

            {/* 左辺 */}
            <Grid container xs={8}>

              <Grid container columns={21}>
                <Grid xs={10}>
                  <Item>補正</Item>
                </Grid>
                <Grid xs={1}>
                  <Item>+</Item>
                </Grid>
                <Grid xs={10}>
                  <Item>糖質</Item>
                </Grid>
              </Grid>              
            </Grid>

            {/* =右辺 */}
            <Grid container xs={4}>

              {/* = */}
              <Grid container xs={1}>
                  <Item>=</Item>
              </Grid>

              {/* 右辺 */}
              <Grid container xs={11}>
                <Item>右辺</Item>
              </Grid>

            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
    //</Container>
  );
};

export default Home