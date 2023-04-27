import React, { useState, useEffect } from 'react';
import { useCookies } from "react-cookie";

import { Box, Button, Paper, Container, Modal, Typography, TextField, Tooltip } from "@mui/material";
import { InputAdornment, IconButton, Fab } from "@mui/material";
import Add from '@mui/icons-material/AddCircle';
import Remove from '@mui/icons-material/RemoveCircle';
import Submit from '@mui/icons-material/Autorenew';
import Copy from '@mui/icons-material/ContentCopy';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import '@fontsource/roboto';

import { NumericFormat } from 'react-number-format';

const Line = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  borderTop: '1px solid',
  padding: theme.spacing(0),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  flex: 1,
}));

const Item = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  border: '0px solid',
  borderColor: theme.palette.mode === 'dark' ? '#444d58' : '#ced7e0',
  padding: theme.spacing(2),
  textAlign: 'center',
  flex: 1,
}));


const theme = createTheme();

interface InsulinVariables {
  mealCarbohydrates: number;
  insulinToCarbRatio: number;
  carbInsulin: number;
  currentBGL: number;
  targetBGL: number;
  insulinSensitivityFactor: number;
  correctionBolusInsulin: number;
  totalInsulin: number;
}

interface InsulinToCarbRatio {
  breakfast: number;
  lunch: number;
  snack: number;
  dinner: number;
}  

const expireLong = () => {
  const time = new Date(); 
  time.setFullYear(time.getFullYear() + 1);
  return time
}

const expireShort = () => {
  const time = new Date(); 
  time.setMinutes(time.getMinutes() + 30); // 30 min later
  //time.setSeconds(time.getSeconds() + 10); // 10 sec later
  return time
}


const Round = (value: number, base: number) => {
  const pow = (10 ** base);
  return Math.round(value * pow) / pow;
}

const Home: React.FC = () => {  
  const [cookies, setCookie, removeCookie] = useCookies();
  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const [mealCarbs, setMealCarbs] = useState(
    cookies.mealCarbs != undefined ? cookies.mealCarbs as number[]: [0]
  );
  const changeMealCarbs = (index: number, value: number) => {
    const data = [...mealCarbs];
    data[index] = value;
    setMealCarbs(data);
  }
  const addMeal = () => {
    setMealCarbs([...mealCarbs, 0]) 
  }
  const deleteMeal = (index: number) => {
    const data = [...mealCarbs];
    data.splice(index, 1);
    setMealCarbs(data);
  }
  useEffect(() => {
    const totalMeal =  mealCarbs.reduce((sum, element) => sum + element, 0);
    setCookie("mealCarbs", mealCarbs, { expires: expireShort(), path: '/' });
    setInsVars(vars =>({
      ...vars, 
      mealCarbohydrates: totalMeal,
    }));
  }, [mealCarbs])

  const currentInsulinToCarbRatio = () => {
    const now = new Date(); 

    if(cookies.insulinToCarbRatio != undefined){
        return cookies.insulinToCarbRatio; // Cookie 
    }

    const currentHour = now.getHours();
    if(6 <= currentHour && currentHour <= 10 && cookies.insulinToCarbRatio_breakfast != undefined){
      return cookies.insulinToCarbRatio_breakfast;
    }
    if(11 <= currentHour && currentHour <= 13 && cookies.insulinToCarbRatio_lunch != undefined){
      return cookies.insulinToCarbRatio_lunch;
    }
    if(14 <= currentHour && currentHour <= 16 && cookies.insulinToCarbRatio_snack != undefined){
      return cookies.insulinToCarbRatio_snack;
    }
    if(17 <= currentHour && currentHour <= 20 && cookies.insulinToCarbRatio_dinner != undefined){
      return cookies.insulinToCarbRatio_dinner;
    }
    return 1.0;
  }

  const [insVars, setInsVars] = useState<InsulinVariables>(() => {
    //console.log("useState");
    return {
      mealCarbohydrates: 0,
      insulinToCarbRatio: currentInsulinToCarbRatio(),
      carbInsulin: 0,
      currentBGL: cookies.currentBGL != undefined? cookies.currentBGL : 100,
      targetBGL: cookies.targetBGL != undefined? cookies.targetBGL : 120,
      insulinSensitivityFactor: cookies.insulinSensitivityFactor != undefined? cookies.insulinSensitivityFactor : 80,
      correctionBolusInsulin: 0,
      totalInsulin: 0,
    };
  });

  useEffect(() => calcCarbInsulin(insVars.mealCarbohydrates, insVars.insulinToCarbRatio), [
    insVars.mealCarbohydrates,
 //   insVars.insulinToCarbRatio,
  ])
  const calcCarbInsulin = (meal: number, ratio: number) => {
    //console.log("calcCarbInsulin");
    setInsVars(vars => ({
      ...vars, 
      carbInsulin: Round(meal * ratio, 2),
    }));
    setCookie("insulinToCarbRatio", ratio, { expires: expireShort(), path: '/' });
  }

  useEffect(() => {calcCorrectionBolusInsulin(insVars.currentBGL, insVars.targetBGL, insVars.insulinSensitivityFactor)}, [
    insVars.currentBGL,
    insVars.targetBGL,
    insVars.insulinSensitivityFactor,
  ])
  const calcCorrectionBolusInsulin = (current: number, target: number, factor: number) => {
    //console.log("calcCorrectionBolusInsulin")
    setInsVars(vars => ({
      ...vars, 
      correctionBolusInsulin: Round((current - target) / factor, 2),
    }));
    setCookie("currentBGL", current, { expires: expireLong(), path: '/' });
    setCookie("targetBGL", target, { expires: expireLong(), path: '/' });
    setCookie("insulinSensitivityFactor", factor, { expires: expireLong(), path: '/' });
  }

  useEffect(() => {calcTotalInsulin(insVars.carbInsulin, insVars.correctionBolusInsulin)}, [
    insVars.carbInsulin,
    insVars.correctionBolusInsulin,
  ])
  const calcTotalInsulin = (carb: number, bolus: number) => {
    //console.log("calcTotalInsulin")
    setInsVars(vars => ({
      ...vars, 
      totalInsulin: Round(carb + bolus, 2),
    }));
  }
  
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => {
    //console.log("handleOpen")
    calcCarbInsulin(insVars.mealCarbohydrates, insVars.insulinToCarbRatio);
    calcCorrectionBolusInsulin(insVars.currentBGL, insVars.targetBGL, insVars.insulinSensitivityFactor);
    calcTotalInsulin(insVars.carbInsulin, insVars.correctionBolusInsulin);
    setOpen(true);
  }

  const [carbRatio, setCarbRatio] = useState<InsulinToCarbRatio>({
    breakfast: cookies.insulinToCarbRatio_breakfast != undefined? cookies.insulinToCarbRatio_breakfast : 1.0,
    lunch: cookies.insulinToCarbRatio_lunch != undefined? cookies.insulinToCarbRatio_lunch : 1.0,
    snack: cookies.insulinToCarbRatio_snack != undefined? cookies.insulinToCarbRatio_snack : 1.0,
    dinner: cookies.insulinToCarbRatio_dinner != undefined? cookies.insulinToCarbRatio_dinner : 1.0,
  });

  const copyTextToClipboard = async(text: string) => {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }

  const [isCopied, setIsCopied] = useState(false);
  const handleCopyClick = () => {
    const copyText = 'カーボ比' 
    + '朝' + Number(carbRatio.breakfast).toFixed(1)  
    + '昼' + Number(carbRatio.lunch).toFixed(1) 
    + '間' + Number(carbRatio.snack).toFixed(1)
    + '夕' + Number(carbRatio.dinner).toFixed(1);
    copyTextToClipboard(copyText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return (
    <ThemeProvider theme={theme}>
      
      <Container component="main" maxWidth="xl">
        <CssBaseline />
        <Box
          sx={{
            mt: 3,
            mb: 3,
            flexDirection: 'column',
          }}
        >

          {/* 補正インスリン */}
          <Paper component="form" sx={{ mb: 3, p:2 }}>
           <Typography component="h2" variant="h5" sx={{ mb: 3}}>補正インスリン</Typography>

            {/* 補正インスリン式 */}
            <Grid container rowSpacing={2} columnSpacing={0}>
              {/* 左辺 */}
              <Grid item xs={12}>
                
                {/* 分数 */}
                <Grid container>
                  {/* 分子 */}
                  <Grid item xs={12}>
                    <Grid container columns={11}>
                      <Grid item xs={5}>
                        <NumericFormat 
                          id="current_BGL" 
                          value={insVars.currentBGL}
                          valueIsNumericString={true}
                          decimalSeparator="."
                          thousandSeparator=","
                          allowNegative={false}
                          decimalScale={0}
                          fixedDecimalScale              
                          inputProps={{ 
                            inputMode: 'numeric', 
                            pattern: '[0-9]*' 
                          }}
                          onValueChange={(values, sourceInfo) => {
                            setInsVars({
                              ...insVars, 
                              currentBGL: values.floatValue as number,
                            });
                          }}
                          onFocus={event => {
                            event.target.select();
                          }}
                          customInput={TextField} 
                          label="食前血糖値" 
                          variant="outlined" 
                          fullWidth
                            />
                      </Grid>

                      <Grid item xs={1}>
                        <Item>
                          <Typography variant="body1">-</Typography>
                        </Item>
                      </Grid>

                      <Grid item xs={5}>
                        <NumericFormat 
                          id="target_BGL" 
                          value={insVars.targetBGL}
                          valueIsNumericString={true}
                          decimalSeparator="."
                          thousandSeparator=","
                          allowNegative={false}
                          decimalScale={0}
                          fixedDecimalScale              
                          inputProps={{ 
                            inputMode: 'numeric', 
                            pattern: '[0-9]*' 
                          }}
                          onValueChange={(values, sourceInfo) => {
                            setInsVars({
                              ...insVars, 
                              targetBGL: values.floatValue as number,
                            });
                          }}
                          onFocus={event => {
                            event.target.select();
                          }}
                          customInput={TextField} 
                          label="目標血糖値" 
                          variant="outlined" 
                          fullWidth
                            />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* 分数線 */}
                  <Grid item xs={12}>
                    <Line></Line>
                  </Grid>      

                  {/* 分母 */}
                  <Grid item xs={12}>
                    <NumericFormat 
                      id="insulin_sensitivity_factor" 
                      value={insVars.insulinSensitivityFactor}
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={0}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'numeric', 
                        pattern: '[0-9]*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          insulinSensitivityFactor: values.floatValue as number,
                        });
                      }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="インスリン効果比" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>

              {/* =右辺 */}
              <Grid item xs={12}>
                <Grid container columns={11}>
                  {/* = */}
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">=</Typography>
                    </Item>
                  </Grid>

                  {/* 右辺 */}
                  <Grid item xs={10}>
                    <NumericFormat 
                      id="correction_bolus_insulin" 
                      value={insVars.correctionBolusInsulin}
                      inputProps={{ readOnly: true }}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={2}
                      fixedDecimalScale
                      onFocus={event => {
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="補正インスリン" 
                      variant="filled" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* 糖質インスリン */}
          <Paper component="form" sx={{ mb: 3, p:2 }}>
            <Grid container direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3}}>
              <Grid item xs={12}>
                <Typography component="h2" variant="h5" >糖質インスリン</Typography>
              </Grid>
            </Grid>

            {/* 各食カーボ比 */}
            <Paper sx={{ p:1, mb:2 }} elevation={0} variant="outlined">
              <Grid container direction="row" justifyContent="space-between" alignItems="center">
                <Grid item xs={10}>
                  <Typography component="h3" variant="body1" >カーボ比</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Grid container justifyContent="flex-end">
                    <Tooltip open={isCopied} title="Copied!" arrow placement="top" 
                            PopperProps={{
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [0, -15],
                                      },
                                    },
                                  ],
                              }}>
                      <IconButton color="primary" size="small" onClick={handleCopyClick}>
                        <Copy  fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
  

              <Grid container columnSpacing={1} sx={{p:1}} >
                <Grid item xs={3}>
                  <NumericFormat 
                      value={carbRatio.breakfast}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={1}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        const value = values.floatValue as number;
                        setCarbRatio({
                          ...carbRatio,
                          breakfast: value
                        });
                        setCookie("insulinToCarbRatio_breakfast", value, { expires: expireLong(), path: '/' });
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: value,
                        });
                      }}
                      onFocus={event => {
                        setInsVars({
                          ...insVars,
                          insulinToCarbRatio: carbRatio.breakfast
                        });
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="朝食" 
                      variant="outlined" 
                      fullWidth
                        />
                </Grid>
                <Grid item xs={3}>
                  <NumericFormat 
                      value={carbRatio.lunch}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={1}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        const value = values.floatValue as number;
                        setCarbRatio({
                          ...carbRatio,
                          lunch: value
                        });
                        setCookie("insulinToCarbRatio_lunch", value, { expires: expireLong(), path: '/' });
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: value,
                        });
                      }}
                      onFocus={event => {
                        setInsVars({
                          ...insVars,
                          insulinToCarbRatio: carbRatio.lunch
                        });
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="昼食" 
                      variant="outlined" 
                      fullWidth
                        />
                </Grid>
                <Grid item xs={3}>
                  <NumericFormat 
                      value={carbRatio.snack}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={1}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        const value = values.floatValue as number;
                        setCarbRatio({
                          ...carbRatio,
                          snack: value
                        });
                        setCookie("insulinToCarbRatio_snack", value, { expires: expireLong(), path: '/' });
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: value,
                        });
                      }}
                      onFocus={event => {
                        setInsVars({
                          ...insVars,
                          insulinToCarbRatio: carbRatio.snack
                        });
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="間食" 
                      variant="outlined" 
                      fullWidth
                        />
                </Grid>
                <Grid item xs={3}>
                  <NumericFormat 
                      value={carbRatio.dinner}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={1}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        const value = values.floatValue as number;
                        setCarbRatio({
                          ...carbRatio,
                          dinner: value
                        });
                        setCookie("insulinToCarbRatio_dinner", value, { expires: expireLong(), path: '/' });
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: value,
                        });
                      }}
                      onFocus={event => {
                        setInsVars({
                          ...insVars,
                          insulinToCarbRatio: carbRatio.dinner
                        });
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="夕食" 
                      variant="outlined" 
                      fullWidth
                        />
                </Grid>
              </Grid>
            </Paper>

            {/* 糖質インスリン式 */}
            <Grid container rowSpacing={2} columnSpacing={0}>
              {/* 左辺 */}
              <Grid item xs={12}>
                <Grid container columns={11}  direction="row" justifyContent="center" alignItems="flex-end">

                  <Grid item xs={5}>
                    <Grid container rowSpacing={1}>
                      {
                        mealCarbs.map((input, index) => {
                          return (
                            <Grid item xs={12} key={index}>
                              <NumericFormat 
                                value={mealCarbs[index]}
                                type="text"
                                valueIsNumericString={true}
                                decimalSeparator="."
                                thousandSeparator=","
                                allowNegative={false}
                                decimalScale={2}
                                fixedDecimalScale              
                                inputProps={{ 
                                  inputMode: 'decimal', 
                                  pattern: '[0-9].*' 
                                }}
                                onValueChange={(values, sourceInfo) => {
                                  changeMealCarbs(index, values.floatValue as number)
                                }}
                                InputProps={{
                                  endAdornment:
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={event => deleteMeal(index)}
                                        onMouseDown={handleMouseDown}
                                        edge="end"
                                        color="error"
                                        size="large"
                                      >
                                        <Remove />
                                      </IconButton>
                                    </InputAdornment>
                                }}
                                onFocus={event => {
                                  event.target.select();
                                }}
                                customInput={TextField} 
                                label="カーボ数" 
                                variant="outlined" 
                                fullWidth
                                  />
                            </Grid>
                          )
                        })
                      }

                      <Grid item xs={12}>
                        <NumericFormat 
                          id="meal_carbohydrates" 
                          value={insVars.mealCarbohydrates}
                          inputProps={{ readOnly: true }}
                          type="text"
                          valueIsNumericString={true}
                          decimalSeparator="."
                          thousandSeparator=","
                          allowNegative={false}
                          decimalScale={2}
                          fixedDecimalScale
                          onFocus={event => {
                            event.target.select();
                          }}
                          InputProps={{
                            endAdornment: 
                              <InputAdornment position="end">
                                <IconButton
                                  sx={{pr:1.75}}
                                  onClick={addMeal}
                                  onMouseDown={handleMouseDown}
                                  edge="end"
                                  color="primary"
                                  size="large"
                                >
                                  <Add />
                                </IconButton>
                              </InputAdornment>
                          }}
                          customInput={TextField} 
                          label="総カーボ数" 
                          variant="filled" 
                          fullWidth
                            />
                      </Grid> 
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">x</Typography>
                    </Item>
                  </Grid>

                  <Grid item xs={5}>
                    <NumericFormat 
                      id="insulin_to_carb_ratio" 
                      value={insVars.insulinToCarbRatio}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={1}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: values.floatValue as number,
                        });
                      }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="カーボ比" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container columns={11}>
                  {/* = */}
                  <Grid item xs={1}>
                      <Item>
                        <Typography variant="body1">=</Typography>
                      </Item>
                  </Grid>

                  {/* 右辺 */}
                  <Grid item xs={10}>
                    <NumericFormat 
                      id="carb_insulin" 
                      value={insVars.carbInsulin}
                      inputProps={{ readOnly: true }}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={2}
                      fixedDecimalScale
                      onFocus={event => {
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="糖質インスリン" 
                      variant="filled" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* 計算ボタン */}
          <Box sx={{ mb: 3 }}>
            <Grid container direction="row" justifyContent="center" alignItems="center">
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  startIcon={<Submit />} 
                  size="large"
                  fullWidth   
                  onClick={handleOpen} >
                  計算
                </Button>
                <Modal
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 400,
                      bgcolor: 'background.paper',
                      border: '2px solid #000',
                      boxShadow: 24,
                      p: 4,
                  }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                      インスリン単位数
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                      ( {insVars.currentBGL} - {insVars.targetBGL} ) / {insVars.insulinSensitivityFactor} + ({insVars.mealCarbohydrates} * {insVars.insulinToCarbRatio}) <br />
                       = {insVars.correctionBolusInsulin} + {insVars.carbInsulin} <br />
                       = {insVars.totalInsulin} &uuml;
                    </Typography>
                  </Box>
                </Modal>
              </Grid>
            </Grid>
          </Box>

          {/* 合計インスリン式 */}
          <Paper component="form" sx={{ mb: 3, p:2 }} >
            <Typography component="h2" variant="h5" sx={{ mb: 3}}>合計インスリン</Typography>
  
            <Grid container rowSpacing={2} columnSpacing={0}>
              {/* 左辺 */}
              <Grid item xs={12}>
                <Grid container columns={11}>

                <Grid item xs={5}>
                    <NumericFormat 
                      id="correction_bolus_insulin2" 
                      value={insVars.correctionBolusInsulin}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={true}
                      decimalScale={2}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          correctionBolusInsulin: values.floatValue as number,
                        });
                      }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      type="text"
                      customInput={TextField} 
                      label="補正インスリン" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                  
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">+</Typography>
                    </Item>
                  </Grid>

                  <Grid item xs={5}>
                    <NumericFormat 
                      id="carb_insulin2" 
                      value={insVars.carbInsulin}
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={2}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          carbInsulin: values.floatValue as number,
                        });
                      }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      type="text"
                      customInput={TextField} 
                      label="糖質インスリン" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                  
                </Grid>
              </Grid>  

              {/* =右辺 */}
              <Grid item xs={12}>
                <Grid container columns={11}>
                  {/* = */}
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">=</Typography>
                    </Item>
                  </Grid>

                  {/* 右辺 */}
                  <Grid item xs={10}>
                    <NumericFormat 
                      id="total_insulin" 
                      value={insVars.totalInsulin}
                      inputProps={{ readOnly: true }}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={2}
                      fixedDecimalScale
                      onFocus={event => {
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="合計インスリン" 
                      variant="filled" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>  
            </Grid>
          </Paper>

        </Box>
      </Container>

    </ThemeProvider>
  );
};

export default Home