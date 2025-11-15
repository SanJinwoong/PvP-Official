-- Crear tabla rooms
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 10,
  admin_id TEXT NOT NULL,
  participants JSONB DEFAULT '[]'::jsonb,
  pairs JSONB DEFAULT '[]'::jsonb,
  bracket JSONB DEFAULT '{"rounds": []}'::jsonb,
  current_round INTEGER DEFAULT 0,
  tournament_started BOOLEAN DEFAULT FALSE,
  tournament_finished BOOLEAN DEFAULT FALSE,
  current_pair_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índice para búsquedas rápidas por código
CREATE INDEX idx_rooms_code ON rooms(code);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en cada UPDATE
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Política de seguridad: permitir todo por ahora (público)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a rooms"
  ON rooms
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Limpiar salas antiguas automáticamente (opcional, después de 24 horas)
CREATE OR REPLACE FUNCTION delete_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE rooms IS 'Salas de torneos PvP efímeras';
COMMENT ON COLUMN rooms.code IS 'Código de 6 caracteres para unirse a la sala';
COMMENT ON COLUMN rooms.participants IS 'Array JSON de participantes con {id, name, avatar, isAdmin, isConnected}';
COMMENT ON COLUMN rooms.pairs IS 'Array JSON de pares con {id, participant1, participant2, winner, isActive}';
COMMENT ON COLUMN rooms.bracket IS 'Estructura completa del bracket con múltiples rondas: {rounds: [{roundNumber, roundName, matches: [{id, participant1, participant2, winner, isActive, matchNumber}], isComplete}], totalParticipants, currentRound, currentMatch}';
COMMENT ON COLUMN rooms.current_round IS 'Ronda actual del torneo (0-indexed)';
