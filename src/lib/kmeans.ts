import { Coordinate, Facility, ClusterResult } from './types';
import { CLUSTER_COLORS } from './constants';

// Euclidean distance
const distance = (a: Coordinate, b: Coordinate): number => {
  return Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2));
};

const getCentroid = (points: Coordinate[]): Coordinate => {
  if (points.length === 0) return { lat: 0, lng: 0 };
  const sum = points.reduce(
    (acc, curr) => ({ lat: acc.lat + curr.lat, lng: acc.lng + curr.lng }),
    { lat: 0, lng: 0 }
  );
  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  };
};

export const runKMeans = (facilities: Facility[], k: number): ClusterResult[] => {
  if (facilities.length === 0 || k <= 0) return [];

  // 1. Initialize Centroids (Randomly pick k facilities as start points)
  let centroids: Coordinate[] = [];
  const shuffled = [...facilities].sort(() => 0.5 - Math.random());
  centroids = shuffled.slice(0, k).map(f => ({ lat: f.lat, lng: f.lng }));

  let clusters: { [key: number]: Facility[] } = {};
  let iterations = 0;
  const maxIterations = 20;
  let hasConverged = false;

  while (!hasConverged && iterations < maxIterations) {
    // 2. Assign points to nearest centroid
    clusters = {};
    for (let i = 0; i < k; i++) clusters[i] = [];

    facilities.forEach(facility => {
      let minDist = Infinity;
      let closestCentroidIndex = 0;

      centroids.forEach((centroid, index) => {
        const dist = distance({ lat: facility.lat, lng: facility.lng }, centroid);
        if (dist < minDist) {
          minDist = dist;
          closestCentroidIndex = index;
        }
      });

      clusters[closestCentroidIndex].push(facility);
    });

    // 3. Recalculate centroids
    const newCentroids: Coordinate[] = [];
    for (let i = 0; i < k; i++) {
      const clusterPoints = clusters[i].map(f => ({ lat: f.lat, lng: f.lng }));
      if (clusterPoints.length > 0) {
        newCentroids[i] = getCentroid(clusterPoints);
      } else {
        newCentroids[i] = centroids[i];
      }
    }

    // Check convergence
    let totalShift = 0;
    for (let i = 0; i < k; i++) {
        totalShift += distance(centroids[i], newCentroids[i]);
    }
    
    if (totalShift < 0.00001) {
        hasConverged = true;
    }

    centroids = newCentroids;
    iterations++;
  }

  // Transform to result format
  const results: ClusterResult[] = Object.keys(clusters).map((key) => {
    const clusterId = parseInt(key);
    return {
      clusterId: clusterId + 1,
      centroid: centroids[clusterId],
      points: clusters[clusterId].map(f => ({ ...f, clusterId: clusterId + 1 })),
      color: CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length],
    };
  });

  return results;
};