"""
Simple HTTP server for RakshakOS (no FastAPI dependencies)
Works with any Python 3.7+ installation
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs
from adapter import parse_rakshak_for_nextjs_frontend
from rakshak import run_rakshak

class RakshakHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Set CORS headers to allow frontend access"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/' or parsed_path.path == '':
            # Health check
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._set_cors_headers()
            self.end_headers()
            
            response = {
                "service": "RakshakOS API",
                "status": "operational",
                "version": "1.0.0"
            }
            self.wfile.write(json.dumps(response).encode())
        
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        
        # Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body.decode('utf-8')) if body else {}
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
            return
        
        if parsed_path.path == '/process_incident':
            try:
                # Extract incident data
                incident_id = data.get('incident_id', 'UNKNOWN')
                
                # Set defaults
                event = data.copy()
                if 'start_lat' not in event or event['start_lat'] is None:
                    event['start_lat'] = event.get('latitude', 0)
                if 'start_lon' not in event or event['start_lon'] is None:
                    event['start_lon'] = event.get('longitude', 0)
                if 'end_lat' not in event or event['end_lat'] is None:
                    event['end_lat'] = event.get('latitude', 0)
                if 'end_lon' not in event or event['end_lon'] is None:
                    event['end_lon'] = event.get('longitude', 0)
                
                # Run the pipeline
                print(f"\n{'='*60}")
                print(f"Processing incident: {incident_id}")
                print(f"{'='*60}")
                
                raw_output = run_rakshak(event)
                
                # Transform for frontend
                command_center_data = parse_rakshak_for_nextjs_frontend(raw_output, incident_id)
                
                # Send response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                
                response = {
                    "status": "success",
                    "data": command_center_data,
                    "raw_output": raw_output
                }
                self.wfile.write(json.dumps(response).encode())
                
                print(f"✅ Successfully processed {incident_id}")
                
            except Exception as e:
                print(f"❌ Error processing incident: {e}")
                import traceback
                traceback.print_exc()
                
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                
                response = {
                    "error": "Pipeline processing failed",
                    "message": str(e)
                }
                self.wfile.write(json.dumps(response).encode())
        
        elif parsed_path.path == '/test_adapter':
            try:
                incident_id = data.get('incident_id', 'TEST-001')
                command_center_data = parse_rakshak_for_nextjs_frontend(data, incident_id)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                
                response = {
                    "status": "success",
                    "data": command_center_data,
                    "note": "Test data - no actual processing"
                }
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                
                response = {
                    "error": "Adapter test failed",
                    "message": str(e)
                }
                self.wfile.write(json.dumps(response).encode())
        
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())
    
    def log_message(self, format, *args):
        """Override to customize log messages"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def run_server(port=8000):
    """Start the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, RakshakHandler)
    
    print("=" * 60)
    print("🚀 RakshakOS Simple API Server")
    print("=" * 60)
    print(f"📡 Server running on http://localhost:{port}")
    print(f"📊 Ready for frontend connections")
    print(f"🔗 Endpoints:")
    print(f"   - GET  / (health check)")
    print(f"   - POST /process_incident")
    print(f"   - POST /test_adapter")
    print("\nPress Ctrl+C to stop")
    print("=" * 60)
    print()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down server...")
        httpd.shutdown()

if __name__ == "__main__":
    run_server(8000)
