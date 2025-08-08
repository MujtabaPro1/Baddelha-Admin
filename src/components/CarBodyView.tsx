import React from 'react';
import clsx from 'clsx'; // for conditional classNames

type BodyCondition = {
  [key: string]: 'original' | 'damaged' | 'repainted' | 'notAvailable';
};

type CarBodySvgProps = {
  data: BodyCondition;
};

const CarBodySvgView: React.FC<CarBodySvgProps> = ({
  data
}) => {

  
  // Helper function to get class names for parts
  const getPartClass = (part: string) => {
    const condition = data?.[part];
    return clsx('part', {
      'original': condition === 'original',
      'damaged': condition === 'damaged',
      'repainted': condition === 'repainted',
      'not-available': condition === 'notAvailable'
    });
  };

  return (
    <svg version="1.1" id="car_unfolded" xmlns="http://www.w3.org/2000/svg"
       x="0px" y="0px" viewBox="-7 97 595.3 600"
       enableBackground="new -7 97 595.3 600" height="600" xmlSpace="preserve">
      <defs>
        <style type="text/css">
          {`.part {
            cursor: pointer;
          }
          
          .part:hover,
          .part:active {
            fill: #ffcccc;
          }
          
          .part.original {
            fill: #fff;
            stroke-width: 2;
          }
          
          .part.damaged {
            fill: orange;
          }
          
          .part.repainted {
            fill: red;
          }
          
          .part.portion-repainted {
            fill: yellow;
          }
          
          .part.not-available {
            fill: gray;
            opacity: 0.8;
          }`}
        </style>
      </defs>
    <path id="rear_left_wing" className={getPartClass('c_n_wing_rear_left')} 
       fill="#FFFFFF" stroke="#032D37" stroke-width="1" d="M223.4,455.8c-4.6,6.6-18.2,20.2-37.5,33.4
       c-19.2,13.2-21.2,3-26.9-6.6c-5.6-9.6-15.2-17.7-40.5-24.3l-0.4-0.1v8.2c0,0,37,4.6,38,34.4c1.1,29.8-38,35.5-38,35.5
       s0.6,26.8,0,35.5c-0.6,8.7,4.6,8.2,9.8,9.8c5.1,1.6,1.1,3.6,4.6,6.7c3.6,3.1,9.8,2.6,14.9,1.1s5.6-14.9,5.6-14.9l19,2.1l-1.6,10.8
       c0,0,7.2,4.6,11.8-9.3c4.6-13.9,4.6-20.5,7.2-28.8c1.9-6,20.2-39.7,26.2-54.4c3.3-8.2,6.2-23.9,7.9-39.5L223.4,455.8z"
    />
 
    <path id="rear_left_wing_decor" fill="none" stroke="#032D37" strokeWidth="2" d="M132.1,462.1v7.9" />
    <path id="rear_left_bumper_line_2" fill="none" stroke="#032D37" strokeWidth="2" d="M132.1,532.2v54.4" />
    <path id="rear_left_wing_line" fill="none" stroke="#032D37" strokeWidth="2" d="M132.2,463.3c0,0,30.9,5.6,30.9,38.5
     c0,32.9-31.4,39.5-31.4,39.5" />
    <path id="rear_left_bumper_line_1" fill="none" stroke="#032D37" strokeWidth="2" d="M152.9,575.7v-46.5" />
 
    <path id="front_left_door" className={getPartClass('c_n_door_front_left')} 
      fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M187.5,400.8c8.6,0.9,33.8,1.7,38,2.3
     c-0.1-18-0.4-39-4.5-49.6c0,0-20-36.5-28.2-49.3c-0.8-1.3-1.6-2.7-2.2-4.2c-11.5-5.1-25.9-6.6-33.9-6.6c-8.1,0-32.9,1.5-38,8.1
     l-0.4,0.5v101.1c9.2-2.1,29.8-4.6,37.8-4.6C169,399,180.7,399.4,187.5,400.8z" 
    />
 
    <path id="front_left_door_decor_2" fill="none" stroke="#032D37" strokeWidth="2" d="M132.1,295.2v104.9" />
    <path id="front_left_door_decor_1" fill="none" stroke="#032D37" strokeWidth="2" d="M153,292.9V398" />
    <path id="front_left_lock" fill="#E6E6E6" stroke="#032D37" strokeWidth="2" d="M171.3,377.5v12.8c0,0.6-1.2,1.1-2.6,1.1
     s-2.6-0.5-2.6-1.1v-12.8c0-0.6,1.2-1.1,2.6-1.1S171.3,376.9,171.3,377.5" />
 
    <path id="rear_left_door" className={getPartClass('c_n_door_rear_left')} 
      fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M159,482.6c5.6,9.6,7.6,19.7,26.9,6.6
     c19.3-13.1,32.9-26.9,37.5-33.4l0.4-0.5c1.4-12.5,2.1-24.8,1.9-33c-0.1-5.3-0.1-12-0.1-19.2c-4.2-0.5-29.4-1.4-38-2.3
     c-6.7-1.4-18.4-1.8-31.4-2.2c-8.1,0-28.7,2.5-37.8,4.6v55.1l0.4,0.1C143.9,464.8,153.5,473,159,482.6z" 
    />
    <path id="rear_left_door_decor_2" fill="none" stroke="#032D37" strokeWidth="2" d="M132.1,400.1v62" />
    <path id="rear_left_door_decor_1" fill="none" stroke="#032D37" strokeWidth="2" d="M153,398v76.5" />
    <path id="rear_left_lock" fill="#E6E6E6" stroke="#032D37" strokeWidth="2" d="M171.3,470.2v12.7c0,0.6-1.2,1.1-2.6,1.1
     s-2.6-0.5-2.6-1.1v-12.8c0-0.6,1.2-1.1,2.6-1.1S171.3,469.5,171.3,470.2" />
 
    <path id="front_left_wing" className={getPartClass('c_n_wing_front_left')} 
      fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M156.6,293.2c8,0,22.4,1.5,33.9,6.6
     c-6-13.9-6.3-37.8-9.1-65.1c-3.1-30.3-11.8-42.7-11.8-42.7l-1.1,14.9l-16-5.6c0,0,0.5-9.3,0.5-17s-8.9-4.5-14.9-6.1
     c-6.1-1.7-6.1,7.5-6.1,7.7l-13.9,6.7v23.7c0,0,38.6,2.6,38,35.4c-0.5,32.9-38,34.9-38,34.9v15.3l0.4-0.5
     C123.6,294.7,148.5,293.2,156.6,293.2z" 
    />
 
    <path id="front_left_bumper_line_1_" fill="none" stroke="#032D37" strokeWidth="2" d="M132.1,185.9v33.4" />
    <path id="front_left_wing_decor_1_" fill="none" stroke="#032D37" strokeWidth="2" d="M132.1,284v11.2" />
    <path id="front_left_wing_line" fill="none" stroke="#032D37" strokeWidth="2" d="M132.7,212.7c0,0,30.9,5.6,30.9,38.5
     s-31.4,39.5-31.4,39.5" />
    <path id="front_left_bumper_line" fill="none" stroke="#032D37" strokeWidth="2" d="M152.5,200.6v22.8" />
    <path id="front_left_wing_decor" fill="none" stroke="#032D37" strokeWidth="2" d="M153,278.5v14.4" />
    <path id="front_left_indicator" fill="#FFCB00" stroke="#032D37" strokeWidth="2" d="M170.8,269.4v5.6c0,0.4-0.9,0.6-2.1,0.6l0,0
     c-1.1,0-2.1-0.3-2.1-0.6l0,0v-5.6c0-0.4,0.9-0.6,2.1-0.6l0,0C169.8,268.9,170.8,269.1,170.8,269.4L170.8,269.4" />
 
    <path id="trunk" className={getPartClass('c_n_boot')} 
      fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M337.6,475c0,0-17.2-4.6-26.3-4.6h-52.7
     c-9.1,0-27.9,4.6-27.9,4.6l-13.6,73.9v39c0,0,29.4,5.1,41.5,5.1h53.2c13.7,0,39.5-5.1,39.5-5.1v-39L337.6,475z" 
    />
 
    <path id="trunk_line" fill="none" stroke="#032D37" strokeWidth="2" d="M351.2,548.9c0,0-14.7,11.1-40,11.1h-52.7
     c-23.3,0-42-11.1-42-11.1" />
 
    <path id="windscreen" className={getPartClass('c_n_windscreen')} 
      fill="#CCEEFF" stroke="#032D37" strokeWidth="2" d="M351.2,298.3L337.5,349c0,0-17.7-3-25.9-3h-53.1
     c-11.1,0-28.4,3-28.4,3L218,298.3c0,0,22.2-6.2,33.4-6.2l66.8,0.8C329.4,292.4,351.2,298.3,351.2,298.3L351.2,298.3z" 
    />
    <path id="front_right_wiper" fill="none" stroke="#032D37" strokeWidth="2" d="M311.2,292.2l11.7,11.7h14.7h-40.5" />
    <path id="front_left_wiper" fill="none" stroke="#032D37" strokeWidth="2" d="M267.7,291.9l11.7,11.7H294h-40.5" />
 
    <path id="rear_screen" className={getPartClass('c_n_rear_screen')} 
      fill="#CCEEFF" stroke="#032D37" strokeWidth="2" d="M330.9,479c0,0-14.7-3-20.2-3h-52.2
     c-7.1,0-20.7,2.5-20.7,2.5s-9.6,33.9-9.6,44.5v15.2h112.4V521C340.6,511.9,330.9,479,330.9,479z" 
    />
    <path id="rear_wiper" fill="none" stroke="#032D37" strokeWidth="2" d="M295,538l11.7-11.7h14.6h-40.5" />
 
    <path id="front" fill="none" stroke="#032D37" strokeWidth="2"
      d="M317.9,170.6l32.9,0.5c0,0,8.6,2,9.1-9.1s-1.1-9.6-1.1-9.6
     l-149.4,0.5V163c0,10.1,8.1,8.1,8.1,8.1H252c0-4.6,3.4-4.1,6.1-4.1c6.1,0,49.1,0,53.7,0C318.6,167.2,317.9,170.6,317.9,170.6z" />
    <path id="right_headlight_line_2" fill="none" stroke="#032D37" strokeWidth="2.2" d="M352,152.8v17.7" />
    <path id="left_headlight_line_2" fill="none" stroke="#032D37" strokeWidth="2.2" d="M217.3,153.1v17.8" />
    <path id="right_headlight_line_1" fill="none" stroke="#032D37" strokeWidth="2.2" d="M330.8,152.6v17.7" />
    <path id="left_headlight_line_1_1_" fill="none" stroke="#032D37" strokeWidth="2.2" d="M237.3,153.6v17.7" />
    <path id="grill_3" fill="none" stroke="#032D37" strokeWidth="2" d="M331.2,156h-93.6" />
    <path id="grill_2" fill="none" stroke="#032D37" strokeWidth="2" d="M330.7,159.6H237" />
    <path id="grill" fill="none" stroke="#032D37" strokeWidth="2" d="M330.9,163.5h-93.7" />
    <path id="left_headlight" fill="#FFFFFF" d="M227.4,153.6h9.3v8.1v8.1h-9.3h-9.3v-8.2v-8.1L227.4,153.6L227.4,153.6z" />
    <path id="right_headlight" fill="#FFFFFF"
      d="M341.3,153.6h9.8v8.1v8.1h-9.8h-9.8v-8.2v-8.1L341.3,153.6L341.3,153.6z" />
 
    <path id="front_bumper" className={getPartClass('c_n_bumper_front')} 
      fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M359.8,140.6c0,0,0.5-13.1-7.6-13.1H218.6
     c-8.1,0-9.1,13.1-9.1,13.1s-4.2,0.5-4.2,5.1s3.6,6.6,3.6,6.6h150.9c0,0,4.6-1.5,4.6-6.6S359.8,140.6,359.8,140.6z" 
    />
 
    <path id="front_bumper_line_1_" fill="none" stroke="#032D37" strokeWidth="2" d="M361.4,140.6H208.9" />
    <path id="front_right_indicator_2_" fill="none" stroke="#032D37" strokeWidth="2" d="M351.2,133.9v0.5c0,1.6-1,2.8-2.3,2.8h-8.1
     c-1.3,0-2.3-1.3-2.3-2.8v-0.5c0-1.6,1-2.8,2.3-2.8h8.1C350.2,131.1,351.2,132.3,351.2,133.9" />
    <path id="front_left_indicator_1_" fill="none" stroke="#032D37" strokeWidth="2" d="M229.9,133.9v0.5c0,1.6-1,2.8-2.3,2.8h-8.1
     c-1.3,0-2.3-1.3-2.3-2.8v-0.5c0-1.6,1-2.8,2.3-2.8h8.1C228.9,131.1,229.9,132.3,229.9,133.9" />
    <path id="front_sensor_4" fill="#3C3C3C" stroke="#032D37" strokeWidth="2" d="M349.1,147.6c-0.9,0-1.5-0.7-1.5-1.5
     s0.7-1.5,1.5-1.5c0.9,0,1.5,0.7,1.5,1.5C350.6,146.8,350,147.6,349.1,147.6z" />
    <path id="front_sensor_3" fill="#3C3C3C" stroke="#032D37" strokeWidth="2" d="M305.9,147.6c-0.9,0-1.5-0.7-1.5-1.5
     s0.7-1.5,1.5-1.5c0.9,0,1.5,0.7,1.5,1.5C307.4,146.8,306.7,147.6,305.9,147.6z" />
    <path id="front_sensor_2" fill="#3C3C3C" stroke="#032D37" strokeWidth="2" d="M262.7,147.6c-0.9,0-1.5-0.7-1.5-1.5
     s0.7-1.5,1.5-1.5c0.9,0,1.5,0.7,1.5,1.5S264.2,146.8,262.7,147.6z" />
    <path id="front_sensor_1" fill="#3C3C3C" stroke="#032D37" strokeWidth="2" d="M219.6,147.6c-0.9,0-1.5-0.7-1.5-1.5
     s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S221,146.8,219.6,147.6z" />
    <path id="right_taillight" fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M356.5,612.4h-26.3v24.3H360l5.1-9.1L356.5,612.4
     L356.5,612.4z" />
    <path id="left_taillight" fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M237.9,612.4v24.3h-28.4l-5.1-8.6l6.6-15.7H237.9
     L237.9,612.4z" />
    <path id="tailgate_line_6" fill="none" stroke="#032D37" strokeWidth="2" d="M335.1,611.4H232.9" />
    <path id="tailgate_line_5" fill="none" stroke="#032D37" strokeWidth="2" d="M334.9,636.7H232.7" />
    <path id="tailgate_line_4" fill="none" stroke="#032D37" strokeWidth="2" d="M311.2,618v5.1H258V618H311.2z" />
    <path id="tailgate_line_3" fill="none" stroke="#032D37" strokeWidth="2" d="M311.7,620.8h19.2" />
    <path id="tailgate_line_2" fill="none" stroke="#032D37" strokeWidth="2" d="M238.4,620.8h19.2" />
    <path id="tailgate_line_1" fill="none" stroke="#032D37" strokeWidth="2" d="M329.9,631.7h-92.1" />
 
    <path id="rear_bumper_1_" className={getPartClass('c_n_bumber_rear')} 
      fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M205.1,643.4c0-4.6,3.6-6.6,3.6-6.6h150.9
     c0,0,4.6,1.5,4.6,6.6s-4.6,5.6-4.6,5.6s0.5,12.7-7.6,12.7H218.3c-8.1,0-9.1-13.2-9.1-13.2S205.1,648,205.1,643.4z" 
    />
 
    <path id="rear_bumper_line" fill="none" stroke="#032D37" strokeWidth="2" d="M361.2,648.5H208.7" />
    <path id="rear_right_indicator_1_" fill="none" stroke="#032D37" strokeWidth="2" d="M351,656v-0.5c0-1.6-1-2.8-2.3-2.8l0,0h-8.1
     c-1.3,0-2.3,1.3-2.3,2.8l0,0v0.5c0,1.6,1,2.8,2.3,2.8l0,0h8.1C350,658.8,351,657.5,351,656L351,656" />
    <path id="rear_left_indicator" fill="none" stroke="#032D37" strokeWidth="2" d="M229.7,656v-0.5c0-1.6-1-2.8-2.3-2.8l0,0h-8.1
     c-1.3,0-2.3,1.3-2.3,2.8l0,0v0.5c0,1.6,1,2.8,2.3,2.8l0,0h8.1C228.7,658.8,229.7,657.5,229.7,656L229.7,656" />
    <path id="towbar_1_" fill="none" stroke="#032D37" strokeWidth="2" d="M286.2,661.9v14.7" />
    <path id="towbar_ball_mount" fill="#3C3C3C" stroke="#032D37" strokeWidth="2" d="M285.9,679.1c-0.9,0-1.5-0.7-1.5-1.5
     c0-0.9,0.7-1.5,1.5-1.5l0,0c0.9,0,1.5,0.7,1.5,1.5S286.8,679.1,285.9,679.1L285.9,679.1" />
    <path id="rear_sensor_4" fill="#3C3C3C" stroke="#032D37" strokeWidth="2" d="M349,644.6c-0.9,0-1.5-0.7-1.5-1.5
     c0-0.9,0.7-1.5,1.5-1.5c0.9,0,1.5,0.7,1.5,1.5S349.8,644.6,349,644.6z" />
    <path id="rear_sensor_3" fill="#3C3C3C" stroke="#032D37" strokeWidth="2" d="M305.8,644.6c-0.9,0-1.5-0.7-1.5-1.5
     c0-0.9,0.7-1.5,1.5-1.5c0.9,0,1.5,0.7,1.5,1.5S306.6,644.6,305.8,644.6z" />
    <path id="rear_sensor_2" fill="#3C3C3C" stroke="#032D37" strokeWidth="2" d="M262.6,644.6c-0.9,0-1.5-0.7-1.5-1.5
     c0-0.9,0.7-1.5,1.5-1.5c0.9,0,1.5,0.7,1.5,1.5S263.4,644.6,262.6,644.6z" />
    <path id="rear_sensor_1" fill="#3C3C3C" stroke="#032D37" strokeWidth="2" d="M219.3,644.6c-0.9,0-1.5-0.7-1.5-1.5
     c0-0.9,0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S220.2,644.6,219.3,644.6z" />
 
    <path id="bonnet" className={getPartClass('c_n_bonnet')} 
      fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M217.6,298.3c0,0,22.7-6.2,33.9-6.2l66.8,0.8
     c11.1-0.5,32.9,5.4,32.9,5.4V194l-37-5.1l-4.1-2.5H259l-5.1,2.5l-36.4,5.6C217.5,194.5,217.6,298.3,217.6,298.3z" 
    />
 
    <path id="bonnet_decor_2" fill="none" stroke="#032D37" strokeWidth="2" d="M310.8,186.9L350,298.1" />
    <path id="bonnet_decor_1" fill="none" stroke="#032D37" strokeWidth="2" d="M259.2,186.4l-40.7,111.4" />
 
    <path id="roof" className={getPartClass('c_n_roof')} 
      fill="#FFFFFF" stroke="#000000" strokeWidth="2" d="M337.6,349c0,0-17.7-3-25.9-3h-53.1c-11.1,0-28.4,3-28.4,3
     s2.5,29.8,2.5,54.6c0,44-2,71.4-2,71.4c0,0,18.8-4.6,27.9-4.6h52.7c9.1,0,26.3,4.6,26.3,4.6s-2-32.8-2-71.3
     C335.6,382.9,337.6,349,337.6,349z" 
    />
    <path id="rear_left_quarter" fill="#CCEEFF" stroke="#032D37" strokeWidth="2" d="M218.4,467.5c0,0-30.3,28.8-31.4,30.9
     c-1,2.1-0.5,41.6-0.5,41.6s17-27.7,21.1-37C211.8,493.6,218.9,470.5,218.4,467.5z" />
 
    <path id="front_left_window" className={getPartClass('c_n_front_left_window')} 
      fill="#CCEEFF" stroke="#032D37" strokeWidth="2" d="M219,361c2.6,10.6,2.6,37.1,2.6,37.1l-34.4-2.6
     v-88.9C187.2,306.6,216.4,351,219,361z" 
    />
    <path id="front_left_vent" fill="none" stroke="#032D37" strokeWidth="2" d="M197.8,321h-10.3" />
 
    <path id="rear_right_wing" className={getPartClass('c_n_wing_rear_right')} 
      fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M345.6,455.8c4.6,6.6,18.2,20.2,37.5,33.4
     c19.2,13.2,21.2,3,26.9-6.6c5.6-9.6,15.2-17.7,40.5-24.3l0.4-0.1v8.2c0,0-37,4.6-38,34.4c-1.1,29.8,38,35.5,38,35.5
     s-0.6,26.8,0,35.5s-4.6,8.2-9.8,9.8c-5.1,1.6-1.1,3.6-4.6,6.7c-3.6,3.1-9.8,2.6-14.9,1.1s-5.6-14.9-5.6-14.9l-19,2.1l1.6,10.8
     c0,0-7.2,4.6-11.8-9.3c-4.6-13.9-4.6-20.5-7.2-28.8c-1.9-6-20.2-39.7-26.2-54.4c-3.3-8.2-6.2-23.9-7.9-39.5L345.6,455.8z" 
    />
 
    <path id="rear_right_wing_decor_2" fill="none" stroke="#032D37" strokeWidth="2" d="M436.9,470v-7.9" />
    <path id="rear_right_bumper_line_2" fill="none" stroke="#032D37" strokeWidth="2" d="M436.9,586.6v-54.4" />
    <path id="rear_right_wing_decor" fill="none" stroke="#032D37" strokeWidth="2" d="M437.3,541.3c0,0-31.4-6.6-31.4-39.5
     s30.9-38.5,30.9-38.5" />
    <path id="rear_right_bumper_line_1" fill="none" stroke="#032D37" strokeWidth="2" d="M416.1,529.2v46.6" />
 
    <path id="front_right_door" className={getPartClass('c_n_door_front_right')} 
      fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M381.5,400.8c-8.6,0.9-33.8,1.7-38,2.3
     c0.1-18,0.4-39,4.5-49.6c0,0,20-36.5,28.2-49.3c0.8-1.3,1.6-2.7,2.2-4.2c11.5-5.1,25.9-6.6,33.9-6.6c8.1,0,32.9,1.5,38,8.1l0.4,0.5
     v101.1c-9.2-2.1-29.8-4.6-37.8-4.6C399.9,399,388.2,399.4,381.5,400.8z" 
    />
 
    <path id="front_right_door_decor_2" fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M436.9,400.1V295.2" />
    <path id="front_right_door_decor_1" fill="none" stroke="#032D37" strokeWidth="2" d="M416,398V292.9" />
    <path id="front_right_lock" fill="#E6E6E6" stroke="#032D37" strokeWidth="2" d="M397.6,377.5c0-0.6,1.2-1.1,2.6-1.1
     s2.6,0.5,2.6,1.1v12.8c0,0.6-1.2,1.1-2.6,1.1s-2.6-0.5-2.6-1.1V377.5" />
    <path id="rear_left_vent" fill="none" stroke="#032D37" strokeWidth="2" d="M381.5,466.4h-19.7" />
 
    <path id="rear_right_door" className={getPartClass('c_n_door_rear_right')} 
      fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M410,482.6c-5.6,9.6-7.6,19.7-26.9,6.6
     c-19.3-13.2-32.9-26.9-37.5-33.4l-0.4-0.5c-1.4-12.5-2.1-24.8-1.9-33c0.1-5.3,0.1-12,0.1-19.2c4.2-0.5,29.4-1.4,38-2.3
     c6.7-1.4,18.4-1.8,31.4-2.2c8.1,0,28.7,2.5,37.8,4.6v55.1l-0.4,0.1C425.2,464.8,415.5,473,410,482.6z" 
    />
 
    <path id="rear_right_door_decor_2" fill="none" stroke="#032D37" strokeWidth="2" d="M436.9,462.1v-62" />
    <path id="rear_right_door_decor_1" fill="none" stroke="#032D37" strokeWidth="2" d="M416,474.5V398" />
    <path id="rear_right_lock" fill="#E6E6E6" stroke="#032D37" strokeWidth="2" d="M397.6,470.2c0-0.6,1.2-1.1,2.6-1.1
     s2.6,0.5,2.6,1.1v12.7c0,0.6-1.2,1.1-2.6,1.1s-2.6-0.5-2.6-1.1V470.2" />
 
    <path id="front_right_wing" className={getPartClass('c_n_wing_front_right')} 
      fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M412.4,293.2c-8,0-22.4,1.5-33.9,6.6
     c6-13.9,6.3-37.8,9.1-65.1c3.1-30.3,11.8-42.7,11.8-42.7l1.1,14.9l16-5.6c0,0-0.5-9.3-0.5-17s8.9-4.5,14.9-6.1
     c6.1-1.7,6.1,7.5,6.1,7.7l13.9,6.7v23.7c0,0-38.6,2.6-38,35.4c0.5,32.9,38,34.9,38,34.9v15.3l-0.4-0.5
     C445.3,294.7,420.5,293.2,412.4,293.2z" 
    />
 
    <path id="front_right_bumper_line_2" fill="none" stroke="#032D37" strokeWidth="2" d="M436.9,219.3v-33.4" />
    <path id="front_right_wing_decor_3" fill="none" stroke="#032D37" strokeWidth="2" d="M436.9,295.2V284" />
    <path id="front_right_wing_decor_2" fill="none" stroke="#032D37" strokeWidth="2" d="M436.8,290.7c0,0-31.4-6.6-31.4-39.5
     s30.9-38.5,30.9-38.5" />
    <path id="front_right_bumper_line" fill="none" stroke="#032D37" strokeWidth="2" d="M416.5,223.4v-22.8" />
    <path id="front_right_wing_decor" fill="none" stroke="#032D37" strokeWidth="2" d="M416,292.9v-14.3" />
    <path id="front_right_indicator" fill="#FFCB00" stroke="#032D37" strokeWidth="2" d="M398.2,269.4L398.2,269.4
     c0-0.4,1-0.6,2.1-0.6l0,0c1.2,0,2.1,0.3,2.1,0.6v5.6l0,0c0,0.4-1,0.6-2.1,0.6l0,0c-1.2,0-2.1-0.3-2.1-0.6V269.4" />
 
    <g>
      <path id="front_left_tire" className="part" fill="#C8C8C8" stroke="#032D37" strokeWidth="2" d="M124.9,279c-15.1,0-27.4-12.3-27.4-27.4
         c0-15.1,12.3-27.4,27.4-27.4c15.1,0,27.4,12.3,27.4,27.4C152.3,266.7,140,279,124.9,279z" />
 
      <path id="front_left_rim" className="part" fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M124.9,267.6c-8.8,0-16-7.1-16-16
         c0-8.8,7.1-16,16-16c8.8,0,16,7.1,16,16C140.8,260.5,133.7,267.6,124.9,267.6z" />
    </g>
 
    <g>
      <path id="front_right_tire" className="part" fill="#C8C8C8" stroke="#032D37" strokeWidth="2" d="M416.7,251.7c0-15.1,12.3-27.4,27.4-27.4
         s27.4,12.3,27.4,27.4c0,15.1-12.3,27.4-27.4,27.4C429,279,416.7,266.8,416.7,251.7z" />
 
      <path id="front_right_rim" className="part" fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M428.2,251.8c0-8.8,7.1-16,16-16s16,7.1,16,16
         c0,8.8-7.1,16-16,16C435.3,267.6,428.2,260.5,428.2,251.8z" />
    </g>
 
    <g>
      <path id="rear_left_tire" className="part" fill="#C8C8C8" stroke="#032D37" strokeWidth="2" d="M124.9,528.9c-15.1,0-27.4-12.3-27.4-27.4
     c0-15.1,12.3-27.4,27.4-27.4c15.1,0,27.3,12.3,27.3,27.4C152.2,516.6,140,528.9,124.9,528.9z" />
 
      <path id="rear_left_rim" className="part" fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M124.9,517.5c-8.8,0-16-7.1-16-16s7.1-16,16-16
     c0,0,0,0,0.1,0c8.8,0,16,7.1,16,16C141,510.4,133.7,517.5,124.9,517.5L124.9,517.5z" />
    </g>
 
    <g >
      <path id="rear_right_tire" className="part" fill="#C8C8C8" stroke="#032D37" strokeWidth="2" d="M416.7,501.5c0-15.1,12.3-27.4,27.4-27.4
     s27.4,12.3,27.4,27.4c0,15.1-12.3,27.4-27.4,27.4S416.7,516.7,416.7,501.5z" />
 
      <path id="rear_right_rim" className="part" fill="#FFFFFF" stroke="#032D37" strokeWidth="2" d="M444.1,517.5c-8.8,0-16-7.1-16-16s7.1-16,16-16
     c0.1,0,0.1,0,0.1,0c8.8,0,16,7.1,16,16C460.1,510.4,453,517.5,444.1,517.5L444.1,517.5z" />
    </g>
 
    <path id="rear_quarter_right_window" fill="#CCEEFF" stroke="#032D37" strokeWidth="2" d="M361.4,502.9c4.1,9.3,21.1,37,21.1,37
     s0.5-39.6-0.5-41.6s-31.4-30.9-31.4-30.9C350.1,470.5,357.2,493.6,361.4,502.9z" />
 
    <path id="front_right_window" className={getPartClass('c_n_front_right_window')} 
      fill="#CCEEFF" stroke="#032D37" strokeWidth="2" d="M382,306.6v88.9l-34.4,2.6
     c0,0-0.1-26.4,2.6-37.1C352.7,351,375.3,312.3,382,306.6L382,306.6z" 
    />
    <path id="front_right_vent" fill="none" stroke="#032D37" strokeWidth="2" d="M381.5,321h-10.3" />
 
    <path id="rear_left_window" className={getPartClass('c_n_rear_left_window')} 
      fill="#CCEEFF" stroke="#032D37" strokeWidth="2" d="M221,407.4l-33.9-1.6v74.5
     c7.5-4.1,26.9-16.7,31.9-26.2C222.5,449,220.5,424.4,221,407.4L221,407.4z" 
    />
    <path id="rear_left_vent_1_" fill="none" stroke="#032D37" strokeWidth="2" d="M207.2,466.4h-19.7" />
 
    <path id="rear_right_window" className={getPartClass('c_n_rear_right_window')} 
      fill="#CCEEFF" stroke="#032D37" strokeWidth="2" d="M348,407.4c0.6,17-1.5,41.6,2.1,46.8
     c4.9,9.5,24.4,22.2,31.9,26.2v-74.5L348,407.4L348,407.4z" 
    />
 
    <path id="sunroof" className={getPartClass('c_sunroof_moonroof')} 
      fill="#CCEEFF" stroke="#032D37" strokeWidth="2" d="M316.5,376.8v16c0,6.2-5.6,11.2-12.4,11.2l0,0h-40.6
     c-6.8,0-12.4-5.1-12.4-11.2l0,0v-16c0-6.2,5.6-11.2,12.4-11.2l0,0H304C311,365.6,316.5,370.6,316.5,376.8L316.5,376.8" 
    />
    <path id="antenna" fill="none" stroke="#032D37" strokeWidth="2" d="M280.3,460.3l13.9-13.9" />
    </svg>
  );
};

export default CarBodySvgView;
