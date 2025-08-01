import React, { useEffect, useState, useCallback } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import JobCard from '../components/JobCard';
import { getReadContract } from '../services/contract';

export default function Browse() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const contract = getReadContract();
      const count = await contract.jobCount();
      const items = [];
      for (let i = 1; i <= Number(count); i++) {
        const job = await contract.jobs(i);
        items.push({ id: i, job });
      }
      setJobs(items);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Browse Jobs
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        jobs.map(({ id, job }) => <JobCard key={id} id={id} job={job} refresh={fetchJobs} />)
      )}
      {jobs.length === 0 && !loading && (
        <Typography variant="body2" color="text.secondary">No jobs posted yet.</Typography>
      )}
    </Container>
  );
}
