import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { Text, ToggleButton, Button, CheckboxField, View, Flex, Heading, Image, Divider, SliderField } from '@aws-amplify/ui-react';
import { getWorkoutSettings } from '../graphql/queries';
import { updateSettings } from '../graphql/mutations';
import Head from 'next/head';
import { Tooltip } from 'react-tooltip';
import { toast } from 'react-toastify';
import { isMobile } from 'react-device-detect';
import muscleGroupList from '../../lib/MuscleGroups';
import workoutTypes from '../../lib/WorkoutTypes';
import equipment from '../../lib/Equipment';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    targetTime: 45,
    frequency: [],
    muscleGroups: [],
    equipment: [
      {
        type: 'bodyweight exercises',
        threshold: 1
      }
    ],
    workoutTypes: [{ type: 'circuit', modifier: '' }],
    specialWorkouts: {
      days: [],
      percentChance: 0,
      equipment: [],
      objective: ''
    }
  });

  const [isSundayChecked, setIsSundayChecked] = useState(false);
  const [isMondayChecked, setIsMondayChecked] = useState(false);
  const [isTuesdayChecked, setIsTuesdayChecked] = useState(false);
  const [isWednesdayChecked, setIsWednesdayChecked] = useState(false);
  const [isThursdayChecked, setIsThursdayChecked] = useState(false);
  const [isFridayChecked, setIsFridayChecked] = useState(false);
  const [isSatdayChecked, setIsSaturdayChecked] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const workoutSettings = await API.graphql({ query: getWorkoutSettings });
      initializeSettings(workoutSettings.data.getMySettings);
    };

    fetchUserData();
  }, []);

  const initializeSettings = (settings) => {
    toggleFrequencyCheckboxes(settings.frequency);

    setSettings(settings);
  };

  const handleWorkoutDayChange = (e) => {
    const { value } = e.target;
    let newFrequency = [...settings.frequency];
    const index = newFrequency.indexOf(value);
    if (index == -1) {
      newFrequency.push(value);
    } else {
      newFrequency.splice(index, 1);
    }
    setSettings(prev => ({ ...prev, frequency: newFrequency }));
    toggleFrequencyCheckboxes(newFrequency);
  };

  const toggleFrequencyCheckboxes = (frequency) => {
    if (!frequency) {
      frequency = [];
    }

    setIsSundayChecked(frequency.includes('Su'));
    setIsMondayChecked(frequency.includes('M'));
    setIsTuesdayChecked(frequency.includes('T'));
    setIsWednesdayChecked(frequency.includes('W'));
    setIsThursdayChecked(frequency.includes('Th'));
    setIsFridayChecked(frequency.includes('F'));
    setIsSaturdayChecked(frequency.includes('Sa'));
  };

  const saveSettings = async () => {
    try {
      const response = await API.graphql({
        query: updateSettings,
        variables: {
          input: settings
        }
      });
      if (response?.data?.updateSettings) {
        toast.success('Settings saved', { position: 'top-right', autoClose: 10000, draggable: false, hideProgressBar: true, theme: 'colored' });
      } else {
        toast.error('Failed to update settings. Please try again', { position: 'top-right', autoClose: 10000, draggable: false, hideProgressBar: true, theme: 'colored' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update settings. Please try again', { position: 'top-right', autoClose: 10000, draggable: false, hideProgressBar: true, theme: 'colored' });
    }
  };

  const updateMuscleGroups = (muscleGroup) => {
    const mg = [...settings.muscleGroups];
    const index = mg.indexOf(muscleGroup);
    if (index > -1) {
      mg.splice(index, 1);
    } else {
      mg.push(muscleGroup)
    }

    setSettings((prev) => ({ ...prev, muscleGroups: mg }));
  };

  const updateWorkoutTypes = (workoutType) => {
    const wt = [...settings?.workoutTypes ?? []];
    const index = wt.indexOf(w => wt.type == workoutType);
    if (index > -1) {
      wt.splice(index, 1);
    } else {
      wt.push({ type: workoutType, modifier: '' });
    }

    setSettings((prev) => ({ ...prev, workoutTypes: wt }));
  };

  const updateEquipment = (equipment) => {
    const e = [...settings?.equipment ?? []];
    const index = e.indexOf(eq => eq.type == equipment);
    if (index > -1) {
      e.splice(index, 1);
    } else {
      e.push({ type: equipment, threshold: .5 });
    }

    setSettings((prev) => ({ ...prev, equipment: e }));
  };

  return (
    <>
      <Head>
        <title>Settings | Ready, Set, Cloud Fitness!</title>
      </Head>
      <Flex direction="column">
        <Flex direction="row" justifyContent="space-between" paddingRight="2em">
          <Flex direction="column" width="75%">
            <Heading level={4}>Workout Settings</Heading>
            <View className="mt-3">
              <Flex direction="column" gap="1em">
                <SliderField
                  name="targetTime"
                  label="Preferred workout length (mins)"
                  value={settings.targetTime}
                  min={15}
                  max={90}
                  width="50%"
                  onChange={(e) => setSettings(prev => ({ ...prev, targetTime: e }))}
                />
                <Text marginBottom=".3em">Workout Days</Text>
                <Flex direction="row" gap=".7em">
                  <CheckboxField label="Sunday" name="su" value="Su" checked={isSundayChecked} onChange={handleWorkoutDayChange} />
                  <CheckboxField label="Monday" name="m" value="M" checked={isMondayChecked} onChange={handleWorkoutDayChange} />
                  <CheckboxField label="Tuesday" name="t" value="T" checked={isTuesdayChecked} onChange={handleWorkoutDayChange} />
                  <CheckboxField label="Wednesday" name="w" value="W" checked={isWednesdayChecked} onChange={handleWorkoutDayChange} />
                  <CheckboxField label="Thursday" name="th" value="Th" checked={isThursdayChecked} onChange={handleWorkoutDayChange} />
                  <CheckboxField label="Friday" name="f" value="F" checked={isFridayChecked} onChange={handleWorkoutDayChange} />
                  <CheckboxField label="Saturday" name="sa" value="Sa" checked={isSatdayChecked} onChange={handleWorkoutDayChange} />
                </Flex>
                <Divider size="large" />
                <Heading level={5}>Workout Builder</Heading>
                <Text fontSize=".9rem"><i>Every week, we will generate a workout for you for every day you have checked above. To help optimize the workouts
                  to best fit your needs, please fill out some additional details below like how many times you'd like to work out certain muscle groups
                  each week and what equipment you have available.</i></Text>
                <Text><b>Workout Types</b></Text>
                <Flex direction="row" wrap="wrap" gap=".75em">
                  {workoutTypes.map(wt => (
                    <ToggleButton
                      variation="primary"
                      name={wt.value}
                      key={wt.value + '-btn'}
                      borderRadius='large'
                      width="fit-content"
                      isPressed={settings.workoutTypes?.find(type => type.type == wt.value)}
                      data-tooltip-id={wt.value + '-tooltip'}
                      onClick={() => updateWorkoutTypes(wt.value)}
                    >{wt.name}
                      {!isMobile && (<Tooltip id={wt.value + '-tooltip'} content={wt.description} />)}
                    </ToggleButton>
                  ))}
                </Flex>
                <Text><b>Muscle Groups</b></Text>
                <Text fontSize=".9rem"><i>Select what you'd like to work out each week. If you choose more muscle groups than workout days, some muscle groups will not be worked out in a given week.</i></Text>
                <Flex direction="row" wrap="wrap" gap=".75em">
                  {muscleGroupList.map(mg => (
                    <ToggleButton
                      variation="primary"
                      name={mg.value}
                      key={mg.value + '-btn'}
                      borderRadius='large'
                      width="fit-content"
                      isPressed={settings.muscleGroups.includes(mg.value)}
                      onClick={() => updateMuscleGroups(mg.value)}
                    >{mg.name}</ToggleButton>
                  ))}
                </Flex>
                <Text marginTop="1em"><b>Available Equipment</b></Text>
                <Text fontSize=".9rem"><i>Select the equipment you have available. Up to 3 will be randomly selected for each workout.</i></Text>
                <Flex direction="row" wrap="wrap" gap=".75em">
                  {equipment.map(e => (
                    <ToggleButton
                      variation="primary"
                      name={e.value}
                      key={e.value + '-btn'}
                      borderRadius='large'
                      width="fit-content"
                      isPressed={settings.equipment.find(eq => eq.type == e.value)}
                      onClick={() => updateEquipment(e.value)}
                    >{e.name}</ToggleButton>
                  ))}
                </Flex>
              </Flex>
              <Button marginTop="2em" type="submit" onClick={saveSettings}>Save</Button>
            </View>
          </Flex>
          <Image src="https://readysetcloud.s3.amazonaws.com/profile.png" height="15em" borderRadius="50%" alt="man lifting barbell over his head" />
        </Flex>
      </Flex>
    </>
  );
};

export default SettingsPage;