#!/usr/bin/env python3
import http.server
import socketserver
import os
import re

class MapLibreHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for cross-origin requests
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range')
        # Enable range requests for PMTiles
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def parse_range_header(self, range_header, file_size):
        """Parse HTTP Range header and return start, end bytes"""
        if not range_header.startswith('bytes='):
            return None, None
        
        range_spec = range_header[6:]  # Remove 'bytes='
        ranges = range_spec.split(',')
        
        # Handle first range only for simplicity
        range_part = ranges[0].strip()
        
        if '-' not in range_part:
            return None, None
            
        start_str, end_str = range_part.split('-', 1)
        
        try:
            if start_str:
                start = int(start_str)
            else:
                start = 0
                
            if end_str:
                end = int(end_str)
            else:
                end = file_size - 1
                
            # Ensure valid range
            start = max(0, min(start, file_size - 1))
            end = max(start, min(end, file_size - 1))
            
            return start, end
        except ValueError:
            return None, None

    def do_GET(self):
        # Serve files from the public directory
        if self.path == '/':
            self.path = '/public/index.html'
        elif not self.path.startswith('/public/'):
            self.path = '/public' + self.path
        
        # Handle range requests for PMTiles files
        if self.path.endswith('.pmtiles'):
            return self.serve_pmtiles_with_range()
        
        return super().do_GET()
    
    def serve_pmtiles_with_range(self):
        """Serve PMTiles files with proper range request support"""
        try:
            # Get the actual file path (already processed by do_GET)
            file_path = self.path[1:]  # Remove leading /
            
            if not os.path.exists(file_path):
                self.send_error(404, "File not found")
                return
                
            file_size = os.path.getsize(file_path)
            
            # Check for Range header
            range_header = self.headers.get('Range')
            
            if range_header:
                start, end = self.parse_range_header(range_header, file_size)
                
                if start is not None and end is not None:
                    # Send partial content
                    self.send_response(206, "Partial Content")
                    self.send_header('Content-Type', 'application/octet-stream')
                    self.send_header('Content-Length', str(end - start + 1))
                    self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                    self.end_headers()
                    
                    # Send the requested byte range
                    with open(file_path, 'rb') as f:
                        f.seek(start)
                        chunk_size = 8192
                        bytes_to_read = end - start + 1
                        
                        while bytes_to_read > 0:
                            chunk = f.read(min(chunk_size, bytes_to_read))
                            if not chunk:
                                break
                            self.wfile.write(chunk)
                            bytes_to_read -= len(chunk)
                    return
            
            # Send full file if no range request
            self.send_response(200)
            self.send_header('Content-Type', 'application/octet-stream')
            self.send_header('Content-Length', str(file_size))
            self.end_headers()
            
            with open(file_path, 'rb') as f:
                chunk_size = 8192
                while True:
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    
        except Exception as e:
            print(f"Error serving PMTiles file: {e}")
            self.send_error(500, "Internal server error")
    
    def do_HEAD(self):
        # Support HEAD requests for PMTiles
        if self.path.endswith('.pmtiles'):
            file_path = self.path[1:] if not self.path.startswith('/public/') else self.path
            if self.path == '/':
                file_path = 'public/index.html'
            elif not self.path.startswith('/public/'):
                file_path = 'public' + self.path
            else:
                file_path = self.path[1:]
                
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                self.send_response(200)
                self.send_header('Content-Type', 'application/octet-stream')
                self.send_header('Content-Length', str(file_size))
                self.end_headers()
            else:
                self.send_error(404, "File not found")
        else:
            super().do_HEAD()
        
    def do_OPTIONS(self):
        # Support OPTIONS requests for CORS preflight
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    PORT = 8000
    
    # Change to the project root directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MapLibreHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.") 