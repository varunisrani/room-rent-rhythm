import { useAuth } from "@/contexts/AuthContext";

export const useManagerFilter = () => {
  const { user } = useAuth();

  // Get the manager's PG name if they're a manager, null if admin
  const getManagerPG = (): string | null => {
    if (user?.role === 'manager' && user.pg_name) {
      return user.pg_name;
    }
    return null; // Admin sees all data
  };

  // Generate filter condition for Supabase queries
  const getFilterCondition = (tableName: 'rooms' | 'residents' | 'electricity_readings' | 'bills') => {
    const managerPG = getManagerPG();
    
    if (!managerPG) {
      // Admin - no filtering needed
      return {};
    }

    // Manager - filter based on PG
    switch (tableName) {
      case 'rooms':
        return { pg_names: managerPG };
      case 'residents':
        // For residents, we need to filter by room_id after getting filtered rooms
        return { managerPG };
      case 'electricity_readings':
        // For electricity readings, we need to filter by room_id after getting filtered rooms
        return { managerPG };
      case 'bills':
        // For bills, we need to filter by resident_id after getting filtered residents
        return { managerPG };
      default:
        return {};
    }
  };

  // Filter array of rooms based on manager's PG
  const filterRooms = (rooms: any[]) => {
    const managerPG = getManagerPG();
    if (!managerPG) return rooms; // Admin sees all
    
    return rooms.filter(room => room.pg_names === managerPG);
  };

  // Get room IDs for manager's PG (used to filter other tables)
  const getManagerRoomIds = (rooms: any[]): string[] => {
    const filteredRooms = filterRooms(rooms);
    return filteredRooms.map(room => room.id);
  };

  // Filter residents based on manager's rooms
  const filterResidents = (residents: any[], rooms: any[]) => {
    const managerPG = getManagerPG();
    if (!managerPG) return residents; // Admin sees all

    const managerRoomIds = getManagerRoomIds(rooms);
    return residents.filter(resident => 
      resident.room_id && managerRoomIds.includes(resident.room_id)
    );
  };

  // Filter electricity readings based on manager's rooms
  const filterElectricityReadings = (readings: any[], rooms: any[]) => {
    const managerPG = getManagerPG();
    if (!managerPG) return readings; // Admin sees all

    const managerRoomIds = getManagerRoomIds(rooms);
    return readings.filter(reading => 
      reading.room_id && managerRoomIds.includes(reading.room_id)
    );
  };

  // Filter bills based on manager's residents
  const filterBills = (bills: any[], residents: any[]) => {
    const managerPG = getManagerPG();
    if (!managerPG) return bills; // Admin sees all

    const managerResidentIds = residents.map(resident => resident.id);
    return bills.filter(bill => 
      bill.resident_id && managerResidentIds.includes(bill.resident_id)
    );
  };

  // Filter bills directly by room_id (when bills table has room_id column)
  const filterBillsByRoom = (bills: any[], rooms: any[]) => {
    const managerPG = getManagerPG();
    if (!managerPG) return bills; // Admin sees all

    const managerRoomIds = getManagerRoomIds(rooms);
    return bills.filter(bill => 
      bill.room_id && managerRoomIds.includes(bill.room_id)
    );
  };

  return {
    getManagerPG,
    getFilterCondition,
    filterRooms,
    getManagerRoomIds,
    filterResidents,
    filterElectricityReadings,
    filterBills,
    filterBillsByRoom,
    isManager: user?.role === 'manager',
    isAdmin: user?.role === 'admin'
  };
};