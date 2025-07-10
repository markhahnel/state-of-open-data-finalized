import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Comparisons from './pages/Comparisons';
import DeepDive from './pages/DeepDive';
import ExecutiveDashboard from './modules/ExecutiveDashboard';
import MotivationsAnalysis from './modules/analysis/MotivationsAnalysis';
import BarriersAnalysis from './modules/analysis/BarriersAnalysis';
import FAIRAnalysis from './modules/analysis/FAIRAnalysis';
import DataManagementAnalysis from './modules/analysis/DataManagementAnalysis';
import PolicySupportAnalysis from './modules/analysis/PolicySupportAnalysis';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/comparisons" element={<Comparisons />} />
            <Route path="/deep-dive" element={<DeepDive />} />
            <Route path="/executive" element={<ExecutiveDashboard />} />
            <Route path="/analysis/motivations" element={<MotivationsAnalysis />} />
            <Route path="/analysis/barriers" element={<BarriersAnalysis />} />
            <Route path="/analysis/fair" element={<FAIRAnalysis />} />
            <Route path="/analysis/data-management" element={<DataManagementAnalysis />} />
            <Route path="/analysis/policy-support" element={<PolicySupportAnalysis />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;