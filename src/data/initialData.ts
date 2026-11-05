/**
 * Initial Seed Data for Nabutiti Village, Kansanga, Kampala
 * Coordinates centered at 0.2845 N, 32.6072 E
 */

import { User, ResidentProfile, CollectorProfile, WasteRequest, DumpingReport, Complaint, ActivityLog, CollectionPoint } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'Kato Ronald',
    email: 'admin@nabutiti.go.ug',
    phone: '+256772100200',
    role: 'admin',
    status: 'active',
    created_at: '2026-09-01 08:00:00'
  },
  {
    id: 2,
    name: 'Hon. Grace Nalubega',
    email: 'leader@nabutiti.go.ug',
    phone: '+256782345678',
    role: 'leader',
    status: 'active',
    created_at: '2026-09-01 08:30:00'
  },
  {
    id: 3,
    name: 'John Ssemwogerere',
    email: 'collector@nabutiti.go.ug',
    phone: '+256701987654',
    role: 'collector',
    status: 'active',
    created_at: '2026-09-02 09:00:00'
  },
  {
    id: 4,
    name: 'Peter Mukasa',
    email: 'peter.collector@nabutiti.go.ug',
    phone: '+256703445566',
    role: 'collector',
    status: 'active',
    created_at: '2026-09-03 09:00:00'
  },
  {
    id: 5,
    name: 'Brenda Nakato',
    email: 'resident@nabutiti.go.ug',
    phone: '+256752112233',
    role: 'resident',
    status: 'active',
    created_at: '2026-09-05 10:15:00'
  },
  {
    id: 6,
    name: 'David Sserunjogi',
    email: 'david.s@nabutiti.go.ug',
    phone: '+256754889900',
    role: 'resident',
    status: 'active',
    created_at: '2026-09-06 11:20:00'
  },
  {
    id: 7,
    name: 'Sarah Namubiru',
    email: 'sarah.n@nabutiti.go.ug',
    phone: '+256778991122',
    role: 'resident',
    status: 'active',
    created_at: '2026-09-07 14:00:00'
  }
];

export const INITIAL_RESIDENTS: ResidentProfile[] = [
  {
    id: 1,
    user_id: 5,
    household_no: 'NAB-Z2-042',
    zone_name: 'Zone B',
    landmark: 'Near Kansanga Market Road, behind St. Kizito Primary'
  },
  {
    id: 2,
    user_id: 6,
    household_no: 'NAB-VA-118',
    zone_name: 'Valley',
    landmark: 'Lower Nabutiti Wetland boundary, near wooden footbridge'
  },
  {
    id: 3,
    user_id: 7,
    household_no: 'NAB-ZA-015',
    zone_name: 'Zone A',
    landmark: 'Upper Nabutiti Ridge, next to Water Tank hill'
  }
];

export const INITIAL_COLLECTORS: CollectorProfile[] = [
  {
    id: 1,
    user_id: 3,
    vehicle_reg_no: 'UBE 418K (Tipper Truck)',
    assigned_zone: 'Zone B',
    is_available: true
  },
  {
    id: 2,
    user_id: 4,
    vehicle_reg_no: 'UBA 902M (Tricycle Hauler)',
    assigned_zone: 'Central',
    is_available: true
  }
];

export const INITIAL_REQUESTS: WasteRequest[] = [
  {
    id: 1,
    resident_id: 1,
    resident_name: 'Brenda Nakato',
    household_no: 'NAB-Z2-042',
    zone_name: 'Zone B',
    phone: '+256752112233',
    waste_type: 'Organic',
    description: '3 sacks of household peelings, matooke peelings, and kitchen scraps',
    latitude: 0.28482,
    longitude: 32.60714,
    address_landmark: 'Plot 14, Zone B, Kansanga Market Lane',
    scheduled_date: '2026-10-18',
    status: 'Assigned',
    created_at: '2026-10-17 09:30:00',
    collector_id: 1,
    collector_name: 'John Ssemwogerere',
    vehicle_reg_no: 'UBE 418K (Tipper Truck)',
    assigned_at: '2026-10-17 14:00:00'
  },
  {
    id: 2,
    resident_id: 2,
    resident_name: 'David Sserunjogi',
    household_no: 'NAB-VA-118',
    zone_name: 'Valley',
    phone: '+256754889900',
    waste_type: 'General',
    description: 'Commercial retail packaging, broken plastics, and cardboard bundles',
    latitude: 0.28315,
    longitude: 32.6094,
    address_landmark: 'Valley Corner, near Footbridge kiosk',
    scheduled_date: '2026-10-18',
    status: 'In_Progress',
    created_at: '2026-10-17 11:15:00',
    collector_id: 1,
    collector_name: 'John Ssemwogerere',
    vehicle_reg_no: 'UBE 418K (Tipper Truck)',
    assigned_at: '2026-10-17 14:05:00'
  },
  {
    id: 3,
    resident_id: 3,
    resident_name: 'Sarah Namubiru',
    household_no: 'NAB-ZA-015',
    zone_name: 'Zone A',
    phone: '+256778991122',
    waste_type: 'Recyclable',
    description: '120 crushed plastic mineral water bottles & aluminum beverage tins',
    latitude: 0.2872,
    longitude: 32.6048,
    address_landmark: 'Zone A Hilltop, opp. Community Water Stand',
    scheduled_date: '2026-10-16',
    status: 'Completed',
    created_at: '2026-10-15 14:20:00',
    collector_id: 2,
    collector_name: 'Peter Mukasa',
    vehicle_reg_no: 'UBA 902M (Tricycle Hauler)',
    assigned_at: '2026-10-15 16:30:00',
    completion_time: '2026-10-16 11:45:00',
    proof_photo: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80',
    collector_notes: 'Successfully loaded 120 plastic bottles and tins. Dispatched to Kansanga recycling depot.'
  },
  {
    id: 4,
    resident_id: 1,
    resident_name: 'Brenda Nakato',
    household_no: 'NAB-Z2-042',
    zone_name: 'Zone B',
    phone: '+256752112233',
    waste_type: 'Hazardous',
    description: 'Used automotive engine oil containers and drained lead acid battery acid jugs',
    latitude: 0.2851,
    longitude: 32.6068,
    address_landmark: 'Garage corner near Zone B Junction',
    scheduled_date: '2026-10-14',
    status: 'Overdue',
    created_at: '2026-10-13 16:45:00'
  },
  {
    id: 5,
    resident_id: 2,
    resident_name: 'David Sserunjogi',
    household_no: 'NAB-VA-118',
    zone_name: 'Valley',
    phone: '+256754889900',
    waste_type: 'Organic',
    description: 'Market stall organic scrap and rotten vegetables',
    latitude: 0.2829,
    longitude: 32.6102,
    address_landmark: 'Valley drainage culvert path',
    scheduled_date: '2026-10-19',
    status: 'Pending',
    created_at: '2026-10-18 07:10:00'
  },
  {
    id: 6,
    resident_id: 1,
    resident_name: 'Brenda Nakato',
    household_no: 'NAB-Z2-042',
    zone_name: 'Zone B',
    phone: '+256752112233',
    waste_type: 'General',
    description: '4 heavy sacks of household packaging, dried yard sweepings, and plastic containers',
    latitude: 0.28482,
    longitude: 32.60714,
    address_landmark: 'Plot 14, Zone B, Kansanga Market Lane',
    scheduled_date: '2026-10-10',
    status: 'Completed',
    created_at: '2026-10-09 10:15:00',
    collector_id: 1,
    collector_name: 'John Ssemwogerere',
    vehicle_reg_no: 'UBE 418K (Tipper Truck)',
    assigned_at: '2026-10-09 14:00:00',
    completion_time: '2026-10-10 12:30:00',
    proof_photo: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    collector_notes: 'All 4 sacks safely weighed, loaded into tipper UBE 418K, and dispatched to Kiteezi transfer hub.'
  },
  {
    id: 7,
    resident_id: 1,
    resident_name: 'Brenda Nakato',
    household_no: 'NAB-Z2-042',
    zone_name: 'Zone B',
    phone: '+256752112233',
    waste_type: 'Organic',
    description: 'Kitchen scraps and banana peels from family lunch',
    latitude: 0.28482,
    longitude: 32.60714,
    address_landmark: 'Plot 14, Zone B, Kansanga Market Lane',
    scheduled_date: '2026-10-11',
    status: 'Cancelled',
    created_at: '2026-10-11 08:20:00',
    collector_notes: 'Request cancelled by resident: Material converted to organic soil compost in private banana grove.'
  },
  {
    id: 8,
    resident_id: 1,
    resident_name: 'Brenda Nakato',
    household_no: 'NAB-Z2-042',
    zone_name: 'Zone B',
    phone: '+256752112233',
    waste_type: 'Recyclable',
    description: 'Clean cardboard bundle and 40 polyethylene water bottles',
    latitude: 0.28482,
    longitude: 32.60714,
    address_landmark: 'Plot 14, Zone B, Kansanga Market Lane',
    scheduled_date: '2026-10-22',
    status: 'Pending',
    created_at: '2026-10-20 14:00:00'
  }
];

export const INITIAL_DUMPING_REPORTS: DumpingReport[] = [
  {
    id: 1,
    reporter_id: 5,
    reporter_name: 'Brenda Nakato',
    location_desc: 'Persistent roadside open heap blocking drainage stream near Valley bridge',
    latitude: 0.2838,
    longitude: 32.6087,
    status: 'Investigating',
    created_at: '2026-10-16 17:00:00'
  },
  {
    id: 2,
    reporter_id: 6,
    reporter_name: 'David Sserunjogi',
    location_desc: 'Construction rubble and discarded mattress foam dumped at night in Zone A wetland',
    latitude: 0.2819,
    longitude: 32.6111,
    status: 'Reported',
    created_at: '2026-10-17 08:30:00'
  },
  {
    id: 3,
    reporter_id: 7,
    reporter_name: 'Sarah Namubiru',
    location_desc: 'Overfilled community bin spilling onto pedestrian footpath',
    latitude: 0.2865,
    longitude: 32.6052,
    status: 'Cleared',
    created_at: '2026-10-12 10:00:00'
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 1,
    resident_id: 1,
    resident_name: 'Brenda Nakato',
    household_no: 'NAB-Z2-042',
    zone_name: 'Zone B',
    request_id: 4,
    complaint_text: 'Hazardous oil containers were scheduled for pickup on October 14th but truck has not visited yet.',
    status: 'Open',
    created_at: '2026-10-15 08:30:00'
  },
  {
    id: 2,
    resident_id: 2,
    resident_name: 'David Sserunjogi',
    household_no: 'NAB-VA-118',
    zone_name: 'Valley',
    complaint_text: 'Drainage trench near our household is choking with plastic bags after Sunday downpour.',
    status: 'Under_Review',
    admin_response: 'Inspection team dispatched under Makindye Division sanitation unit.',
    created_at: '2026-10-16 12:00:00'
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 1,
    action: 'System database initialized with Nabutiti Village sub-zones',
    ip_address: '127.0.0.1',
    created_at: '2026-09-01 08:00:00'
  },
  {
    id: 2,
    action: 'Resident Brenda Nakato submitted waste collection request #1',
    ip_address: '192.168.1.45',
    created_at: '2026-10-17 09:30:00'
  },
  {
    id: 3,
    action: 'Administrator dispatched Request #1 to Collector John Ssemwogerere',
    ip_address: '192.168.1.10',
    created_at: '2026-10-17 14:00:00'
  },
  {
    id: 4,
    action: 'Collector John Ssemwogerere confirmed pickup for Request #3 with photo proof',
    ip_address: '192.168.1.88',
    created_at: '2026-10-16 11:45:00'
  }
];

export const INITIAL_COLLECTION_POINTS: CollectionPoint[] = [
  {
    id: 'cp-01',
    name: 'Kansanga Market Central Bin Bank',
    zone: 'Zone B',
    landmark: 'Kansanga Market Lane, opposite St. Kizito Primary gate',
    latitude: 0.2848,
    longitude: 32.6071,
    wasteAccepted: ['Organic', 'General', 'Recyclable'],
    openingHours: '24 Hours Daily (High Capacity Skip)',
    managedBy: 'Makindye Division Sanitation Dept',
    contact: '+256 772 100 200',
    status: 'Open'
  },
  {
    id: 'cp-02',
    name: 'Nabutiti Hilltop Recycling & Drop-Off Station',
    zone: 'Zone A',
    landmark: 'Upper Ridge Road, next to National Water Tank Reservoir',
    latitude: 0.2868,
    longitude: 32.6055,
    wasteAccepted: ['Recyclable', 'Hazardous'],
    openingHours: 'Mon - Sat: 7:00 AM - 6:30 PM',
    managedBy: 'Nabutiti Environmental Youth Volunteers',
    contact: '+256 782 345 678',
    status: 'Open'
  },
  {
    id: 'cp-03',
    name: 'Nabutiti Community Center Disposal Depot',
    zone: 'Central',
    landmark: 'LC1 Parish Office Grounds, Central Community Hall',
    latitude: 0.2835,
    longitude: 32.6080,
    wasteAccepted: ['Organic', 'General', 'Recyclable'],
    openingHours: 'Daily: 6:00 AM - 8:00 PM',
    managedBy: 'Nabutiti LC1 Village Sanitation Committee',
    contact: '+256 701 556 778',
    status: 'Open'
  },
  {
    id: 'cp-04',
    name: 'Valley Wetland Buffer Collection Cage',
    zone: 'Valley',
    landmark: 'Valley Drainage Footbridge, Lower Wetland Crossing',
    latitude: 0.2825,
    longitude: 32.6095,
    wasteAccepted: ['Recyclable', 'General'],
    openingHours: 'Mon, Wed, Fri: 8:00 AM - 5:00 PM',
    managedBy: 'Kampala Wetland Taskforce & Local Haulers',
    contact: '+256 754 889 900',
    status: 'Open'
  },
  {
    id: 'cp-05',
    name: 'Ggaba Road Corridor E-Waste & Sorting Point',
    zone: 'Zone B',
    landmark: 'Ggaba Road Junction, near Petrocity Service Station',
    latitude: 0.2875,
    longitude: 32.6045,
    wasteAccepted: ['Hazardous', 'Recyclable'],
    openingHours: 'Tue & Thu: 9:00 AM - 5:00 PM',
    managedBy: 'KCCA Environmental Unit Makindye',
    contact: '+256 772 900 112',
    status: 'Open'
  }
];
