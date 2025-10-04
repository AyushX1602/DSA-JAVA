import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useStops,
  useCreateStop,
  usePlaces,
  useCreatePlace,
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useUpdateStop,
  useDeleteStop,
} from '@/hooks/react-query/use-stops-places';
import {
  useEstimateActivityCost,
  useTripImages,
  useNarrateActivity,
} from '@/hooks/react-query/use-ai-trip-generation';
import { useTrip } from '@/hooks/react-query/use-trips';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, ChevronRight, Sparkles, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Select from 'react-select';
import citiesData from '@/assets/cities.json';
import TripOverviewMap from '@/components/ui/trip-overview-map';
import TripMetricsCard from '@/components/Planner/TripMetricsCard';
import TripImageCarousel from './TripImageCarousel';
import { useAtomValue } from 'jotai';
import { authUserAtom } from '@/lib/auth.atoms';

const fromLocal = (val) => (val ? new Date(val).toISOString() : undefined);

const ActivityForm = ({ placeId, onCancel, initial, placeName, cityName }) => {
  const { mutateAsync: createActivity, isPending: creating } =
    useCreateActivity(placeId);
  const { mutateAsync: updateActivity, isPending: updating } =
    useUpdateActivity(placeId);
  const { mutateAsync: estimateCost, isPending: estimating } =
    useEstimateActivityCost();
  const [form, setForm] = useState({
    title: '',
    description: '',
    expense: '',
    startTime: '',
    endTime: '',
    ...(initial || {}),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description || undefined,
      expense: form.expense === '' ? undefined : Number(form.expense),
      startTime: fromLocal(form.startTime),
      endTime: fromLocal(form.endTime),
    };

    if (initial) {
      await updateActivity({ activityId: initial.id, data: payload });
    } else {
      await createActivity(payload);
    }
    onCancel();
  };

  const handleEstimateCost = async () => {
    if (!form.title.trim()) {
      alert('Please enter an activity title first');
      return;
    }

    try {
      const result = await estimateCost({
        title: form.title,
        description: form.description || '',
        placeName: placeName || 'Unknown Place',
        city: cityName || 'Unknown City',
        startTime: form.startTime || new Date().toISOString(),
        endTime: form.endTime || new Date().toISOString(),
      });

      // Update the form with the estimated cost
      setForm((prev) => ({
        ...prev,
        expense: result.estimatedCost.toString(),
      }));
    } catch (error) {
      console.error('Cost estimation failed:', error);
      alert('Failed to estimate cost. Please try again.');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">
          {initial ? 'Edit Activity' : 'New Activity'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="expense" className="mb-2 block">
                Expense
              </Label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    id="expense"
                    type="number"
                    step="0.01"
                    value={form.expense}
                    onChange={(e) =>
                      setForm({ ...form, expense: e.target.value })
                    }
                    className="pl-7"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleEstimateCost}
                  disabled={estimating || !form.title.trim()}
                  className="text-xs px-2 py-1 underline decoration-2 underline-offset-2"
                >
                  {estimating ? 'Estimating...' : 'Estimate'}
                </Button>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={creating || updating}>
              {creating || updating ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PlaceForm = ({ stopId, onCancel }) => {
  const { mutateAsync: createPlace, isPending } = useCreatePlace(stopId);
  const [form, setForm] = useState({ name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPlace({
      name: form.name,
    });
    onCancel();
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">New Place</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="place-name">Place Name</Label>
            <Input
              id="place-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter place name..."
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending || !form.name.trim()}>
              {isPending ? 'Creating...' : 'Create Place'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PlaceBlock = ({ place, cityName, trip, stop, canEdit }) => {
  const { data: activities } = useActivities(place.id);
  const { mutateAsync: deleteActivity } = useDeleteActivity(place.id);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [playingActivityId, setPlayingActivityId] = useState(null);
  const [summariesByActivityId, setSummariesByActivityId] = useState({});
  const [narratingActivityId, setNarratingActivityId] = useState(null);
  const audioRef = useRef(null);
  const audioCacheRef = useRef({});
  const { mutateAsync: narrateActivity } = useNarrateActivity();

  const totalExpense = (activities || []).reduce(
    (sum, a) => sum + (Number(a.expense) || 0),
    0,
  );

  const handleDeleteActivity = async (activityId) => {
    if (confirm('Delete this activity?')) {
      await deleteActivity(activityId);
    }
  };

  return (
    <div className="ml-4 border-l-2 border-gray-200 pl-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-medium">{place.name}</h4>
          <p className="text-xs text-gray-500">
            {place.latitude && place.longitude
              ? `${place.latitude}, ${place.longitude}`
              : 'No coordinates'}
          </p>
        </div>
        <Badge variant="secondary">${totalExpense.toFixed(2)}</Badge>
      </div>

      <div className="space-y-2 mb-3">
        {(activities || []).map((activity) => (
          <div key={activity.id} className="bg-gray-50 p-3 rounded border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-sm">{activity.title}</h5>
                  <Badge>${Number(activity.expense || 0).toFixed(2)}</Badge>
                </div>
                {activity.description && (
                  <p className="text-xs text-gray-600 mt-1">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.startTime).toLocaleString()} -{' '}
                  {new Date(activity.endTime).toLocaleString()}
                </p>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={async () => {
                      if (playingActivityId === activity.id) {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                          audioRef.current = null;
                        }
                        setPlayingActivityId(null);
                        return;
                      }

                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        audioRef.current = null;
                      }

                      const cachedAudio = audioCacheRef.current[activity.id];
                      if (cachedAudio) {
                        try {
                          const audio = new Audio(
                            `data:audio/mpeg;base64,${cachedAudio}`,
                          );
                          audioRef.current = audio;
                          audio.onended = () => setPlayingActivityId(null);
                          audio.onerror = () => setPlayingActivityId(null);
                          await audio.play();
                          setPlayingActivityId(activity.id);
                          return;
                        } catch (err) {
                          console.error('Failed to play cached audio', err);
                          setPlayingActivityId(null);
                        }
                      }

                      setNarratingActivityId(activity.id);
                      try {
                        const result = await narrateActivity({
                          trip: trip
                            ? { name: trip.name, description: trip.description }
                            : null,
                          stop: stop
                            ? { city: stop.city, notes: stop.notes }
                            : { city: cityName },
                          place: { name: place.name },
                          activity: {
                            title: activity.title,
                            description: activity.description || '',
                            expense:
                              typeof activity.expense === 'number'
                                ? activity.expense
                                : Number(activity.expense || 0),
                            startTime: activity.startTime,
                            endTime: activity.endTime,
                          },
                        });

                        if (result?.transcript) {
                          setSummariesByActivityId((prev) => ({
                            ...prev,
                            [activity.id]: result.transcript,
                          }));
                        }
                        if (result?.audioBase64) {
                          audioCacheRef.current[activity.id] =
                            result.audioBase64;
                        }

                        const audio = new Audio(
                          `data:audio/mpeg;base64,${result.audioBase64}`,
                        );
                        audioRef.current = audio;
                        audio.onended = () => setPlayingActivityId(null);
                        audio.onerror = () => setPlayingActivityId(null);
                        await audio.play();
                        setPlayingActivityId(activity.id);
                      } catch (err) {
                        console.error('Failed to narrate activity', err);
                        setPlayingActivityId(null);
                      } finally {
                        setNarratingActivityId(null);
                      }
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-base transition-colors focus:outline-none focus-visible:outline-none cursor-pointer"
                    aria-label={
                      playingActivityId === activity.id
                        ? 'Pause activity'
                        : 'Play activity'
                    }
                    title={playingActivityId === activity.id ? 'Pause' : 'Play'}
                    disabled={narratingActivityId === activity.id}
                  >
                    {narratingActivityId === activity.id ? (
                      <Sparkles className="w-5 h-5 text-[#3B82F6] animate-pulse" />
                    ) : playingActivityId === activity.id ? (
                      <Pause className="w-5 h-5 text-[#fc64ab]" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-foreground hover:text-[#fc64ab] transition-colors" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingActivity(activity)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-base transition-colors focus:outline-none focus-visible:outline-none cursor-pointer"
                    aria-label="Edit activity"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5 text-foreground hover:text-[#fc64ab] transition-colors" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-base transition-colors focus:outline-none focus-visible:outline-none cursor-pointer"
                    aria-label="Delete activity"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-foreground hover:text-[#FF001C] transition-colors" />
                  </button>
                </div>
              )}
            </div>
            {summariesByActivityId[activity.id] && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-[11px] sm:text-xs text-gray-700 leading-relaxed">
                  {summariesByActivityId[activity.id]}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {canEdit && editingActivity && (
        <ActivityForm
          placeId={place.id}
          placeName={place.name}
          cityName={cityName}
          initial={{
            id: editingActivity.id,
            title: editingActivity.title,
            description: editingActivity.description ?? '',
            expense: editingActivity.expense?.toString() ?? '',
            startTime: new Date(editingActivity.startTime)
              .toISOString()
              .slice(0, 16),
            endTime: new Date(editingActivity.endTime)
              .toISOString()
              .slice(0, 16),
          }}
          onCancel={() => setEditingActivity(null)}
        />
      )}

      {canEdit && showActivityForm && (
        <ActivityForm
          placeId={place.id}
          placeName={place.name}
          cityName={cityName}
          onCancel={() => setShowActivityForm(false)}
        />
      )}

      {canEdit && !showActivityForm && !editingActivity && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowActivityForm(true)}
          className="text-xs"
        >
          + Add Activity
        </Button>
      )}
    </div>
  );
};

const StopBlock = ({ stop, trip, onEditStop, onDeleteStop, canEdit }) => {
  const { data: places } = usePlaces(stop.id);
  const [showPlaceForm, setShowPlaceForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-4 transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{stop.city}</CardTitle>
            <p className="text-sm text-gray-600">
              {new Date(stop.startDate).toLocaleDateString()} -{' '}
              {new Date(stop.endDate).toLocaleDateString()}
            </p>
            {stop.notes && (
              <p className="text-xs text-gray-500 mt-1">{stop.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStop(stop);
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-base transition-colors focus:outline-none focus-visible:outline-none cursor-pointer"
                  aria-label="Edit stop"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5 text-foreground hover:text-[#fc64ab] transition-colors" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStop(stop.id);
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-base transition-colors focus:outline-none focus-visible:outline-none cursor-pointer"
                  aria-label="Delete stop"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-foreground hover:text-[#FF001C] transition-colors" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-base transition-colors focus:outline-none focus-visible:outline-none cursor-pointer"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <ChevronRight
                className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
              />
            </button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {(places || []).map((place) => (
              <PlaceBlock
                key={place.id}
                place={place}
                cityName={stop.city}
                trip={trip}
                stop={stop}
                canEdit={canEdit}
              />
            ))}
          </div>

          {canEdit && showPlaceForm && (
            <PlaceForm
              stopId={stop.id}
              onCancel={() => setShowPlaceForm(false)}
            />
          )}

          {canEdit && !showPlaceForm && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPlaceForm(true)}
              className="mt-4"
            >
              + Add Place
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};

const StopForm = ({ onCancel, initial, tripId }) => {
  const { mutateAsync: createStop, isPending: creating } =
    useCreateStop(tripId);
  const { mutateAsync: updateStop, isPending: updating } =
    useUpdateStop(tripId);
  const [form, setForm] = useState({
    city: '',
    startDate: '',
    endDate: '',
    notes: '',
    ...(initial || {}),
  });
  const [selectedCity, setSelectedCity] = useState(null);

  // Transform cities data for React Select
  const cityOptions = useMemo(
    () =>
      citiesData.map((city) => ({
        value: city.place,
        label: city.place,
        latitude: city.latitude,
        longitude: city.longitude,
      })),
    [],
  );

  // Prefill city select when editing
  const prefilledOption = useMemo(() => {
    if (!initial?.city) return null;
    const target = String(initial.city).toLowerCase();
    return (
      cityOptions.find((opt) => opt.value.toLowerCase() === target) || null
    );
  }, [initial?.city, cityOptions]);

  useEffect(() => {
    if (!selectedCity && prefilledOption) {
      setSelectedCity(prefilledOption);
    }
  }, [prefilledOption, selectedCity]);

  const handleCitySelect = (selectedOption) => {
    setSelectedCity(selectedOption);
    if (selectedOption) {
      setForm({
        ...form,
        city: selectedOption.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      city: form.city,
      startDate: fromLocal(form.startDate),
      endDate: fromLocal(form.endDate),
      notes: form.notes || undefined,
    };

    if (initial) {
      await updateStop({ stopId: initial.id, data: payload });
    } else {
      await createStop(payload);
    }
    onCancel();
  };

  // Custom styles for React Select (same as before)
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'white',
      border: '2px solid #000',
      borderRadius: '8px',
      minHeight: '40px',
      boxShadow: state.isFocused ? '0 0 0 1px #000' : 'none',
      '&:hover': {
        border: '2px solid #000',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#fc64ab',
      border: '2px solid #000',
      borderRadius: '8px',
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#f472b6' : 'transparent',
      color: 'white',
      cursor: 'pointer',
      padding: '8px 12px',
      '&:hover': {
        backgroundColor: '#f472b6',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#000',
    }),
    input: (provided) => ({
      ...provided,
      color: '#000',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#666',
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '200px',
      padding: '4px',
    }),
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{initial ? 'Edit Stop' : 'New Stop'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="city-select">City Name</Label>
            <Select
              id="city-select"
              value={selectedCity ?? prefilledOption}
              onChange={handleCitySelect}
              options={cityOptions}
              placeholder="Search for a city..."
              isClearable
              isSearchable
              styles={customStyles}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={creating || updating || !selectedCity}
            >
              {creating || updating
                ? 'Saving...'
                : initial
                  ? 'Update Stop'
                  : 'Create Stop'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const TripPlanner = () => {
  const { id: tripId } = useParams();
  const user = useAtomValue(authUserAtom);
  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useTrip(tripId);
  const {
    data: stops,
    isLoading: stopsLoading,
    error: stopsError,
  } = useStops(tripId);
  const { data: placeImages, isLoading: imagesLoading } = useTripImages(tripId);
  const { mutateAsync: deleteStop } = useDeleteStop(tripId);
  const [showStopForm, setShowStopForm] = useState(false);
  const [editingStop, setEditingStop] = useState(null);

  // Check if user can edit this trip
  const canEdit = user && trip?.isOwned;

  const metrics = useMemo(() => {
    const stopsArr = Array.isArray(stops) ? stops : [];
    let totalSpend = 0;
    let placesCount = 0;
    let activitiesCount = 0;

    for (const stop of stopsArr) {
      const places = Array.isArray(stop?.places) ? stop.places : [];
      placesCount += places.length;
      for (const place of places) {
        const activities = Array.isArray(place?.activities)
          ? place.activities
          : [];
        activitiesCount += activities.length;
        for (const activity of activities) {
          if (activity.expense && !isNaN(Number(activity.expense))) {
            totalSpend += Number(activity.expense);
          }
        }
      }
    }

    let durationDays = 1;
    if (trip?.startDate && trip?.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffMs = end.getTime() - start.getTime();
      durationDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    return {
      totalSpend,
      durationDays,
      avgPerDay: durationDays > 0 ? totalSpend / durationDays : 0,
      placesCount,
      activitiesCount,
    };
  }, [trip, stops]);

  const handleDeleteStop = async (stopId) => {
    if (confirm('Delete this stop and all its places/activities?')) {
      await deleteStop(stopId);
    }
  };

  const handleEditStop = (stop) => {
    setEditingStop({
      id: stop.id,
      city: stop.city,
      startDate: new Date(stop.startDate).toISOString().slice(0, 16),
      endDate: new Date(stop.endDate).toISOString().slice(0, 16),
      notes: stop.notes ?? '',
    });
  };

  if (tripError || stopsError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-red-600">
          <h1 className="text-2xl font-bold mb-4">Error Loading Trip</h1>
          <p>Trip ID: {tripId}</p>
          {tripError && <p>Trip Error: {tripError.message}</p>}
          {stopsError && <p>Stops Error: {stopsError.message}</p>}
        </div>
      </div>
    );
  }

  if (tripLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading Trip...</h1>
          <p className="text-gray-600 mt-2">Trip ID: {tripId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            Trip Planner: {trip?.name || 'Unknown Trip'}
          </h1>
          {!canEdit && (
            <Badge variant="outline" className="text-sm">
              View Only -{' '}
              {trip?.ownerName ? `by ${trip?.ownerName}` : 'Public Trip'}
            </Badge>
          )}
        </div>
        {canEdit && !showStopForm && !editingStop && (
          <Button onClick={() => setShowStopForm(true)}>+ Add Stop</Button>
        )}
      </div>

      {/* Trip Image Carousel and Stats in same row */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Left side - Image Carousel spans 1 column */}
        <div className="col-span-1 flex justify-center items-center h-full">
          {imagesLoading ? (
            <p>Loading images...</p>
          ) : (
            <TripImageCarousel
              placeImages={placeImages}
              tripName={trip?.name}
            />
          )}
        </div>

        {/* Right side - Trip Metrics in 2x2 grid spans 2 columns */}
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-4 h-full">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Expenses
                </h3>
                <p className="text-2xl font-bold">
                  ${metrics.totalSpend.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Average/Day
                </h3>
                <p className="text-2xl font-bold">
                  ${metrics.avgPerDay.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Places Visited
                </h3>
                <p className="text-2xl font-bold">{metrics.placesCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Activities Done
                </h3>
                <p className="text-2xl font-bold">{metrics.activitiesCount}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {canEdit && showStopForm && (
        <StopForm tripId={tripId} onCancel={() => setShowStopForm(false)} />
      )}

      {/* Editing a stop is rendered inline under that specific stop below */}

      <div className="space-y-4">
        {stopsLoading ? (
          <div className="text-center py-8 text-gray-500">Loading stops...</div>
        ) : (
          (stops || []).map((stop) => (
            <div key={stop.id}>
              <StopBlock
                stop={stop}
                trip={trip}
                onEditStop={handleEditStop}
                onDeleteStop={handleDeleteStop}
                canEdit={canEdit}
              />
              {canEdit && editingStop?.id === stop.id && (
                <div className="mt-2 ml-6">
                  <StopForm
                    tripId={tripId}
                    initial={editingStop}
                    onCancel={() => setEditingStop(null)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {!stops?.length && !showStopForm && !stopsLoading && (
        <div className="text-center py-12 text-gray-500">
          <p>No stops yet. Create your first stop to start planning!</p>
        </div>
      )}

      {!!stops?.length && (
        <div className="mt-8">
          <TripOverviewMap stops={stops} height="400px" />
        </div>
      )}
    </div>
  );
};

export default TripPlanner;
