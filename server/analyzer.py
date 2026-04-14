import os
import yaml
from pathlib import Path

class YOLOAnalyzer:
    def __init__(self, dataset_path):
        self.root = Path(dataset_path)
        self.exclude_dirs = {'__MACOSX', '.git', '.ipynb_checkpoints'}
        self.image_exts = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}
        
        self.report = {
            "total_images": 0,
            "total_labels": 0,
            "classes": [],
            "nc": 0,
            "score": 100,
            "issues": []
        }

    def analyze(self):
        all_files = []
        for root, dirs, files in os.walk(self.root):
            dirs[:] = [d for d in dirs if d not in self.exclude_dirs]
            for file in files:
                all_files.append(Path(root) / file)

        # 1. Map all images by their names (stems)
        image_map = {f.stem: f for f in all_files if f.suffix.lower() in self.image_exts}
        
        # 2. Map all potential labels
        valid_labels = []
        for f in all_files:
            if f.suffix == '.txt':
                if f.stem in ['classes', 'notes', 'README', 'requirements']:
                    continue
                if f.stem in image_map:
                    valid_labels.append(f)

        self.report["total_images"] = len(image_map)
        self.report["total_labels"] = len(valid_labels)

        # 3. YAML Parsing
        yaml_files = [f for f in all_files if f.suffix in {'.yaml', '.yml'}]
        if yaml_files:
            try:
                with open(yaml_files[0], 'r') as f:
                    data = yaml.safe_load(f)
                    if data and 'names' in data:
                        names = data['names']
                        self.report["classes"] = list(names.values()) if isinstance(names, dict) else names
                        self.report["nc"] = data.get('nc', len(self.report["classes"]))
            except:
                pass

        # 4. Class Distribution Analysis
        class_counts = {}
        for label_path in valid_labels:
            try:
                with open(label_path, 'r') as f:
                    for line in f:
                        parts = line.split()
                        if parts:
                            cls_id = int(parts[0])
                            class_counts[cls_id] = class_counts.get(cls_id, 0) + 1
            except:
                continue
        
        # Map IDs to Names if available
        dist = {}
        for cls_id, count in class_counts.items():
            name = self.report["classes"][cls_id] if cls_id < len(self.report["classes"]) else f"Class_{cls_id}"
            dist[name] = count
        self.report["class_distribution"] = dist

        # 5. Image Resolution Detection (Sample first 5 images)
        try:
            from PIL import Image
            resolutions = []
            sample_images = list(image_map.values())[:5]
            for img_p in sample_images:
                with Image.open(img_p) as img:
                    resolutions.append(img.size)
            if resolutions:
                avg_w = sum(r[0] for r in resolutions) // len(resolutions)
                avg_h = sum(r[1] for r in resolutions) // len(resolutions)
                self.report["avg_resolution"] = f"{avg_w}x{avg_h}"
            else:
                self.report["avg_resolution"] = "unknown"
        except:
            self.report["avg_resolution"] = "unknown"

        # 6. Score
        self._calculate_score()
        return self.report

    def _calculate_score(self):
        if self.report["total_images"] == 0:
            self.report["score"] = 0
            return
        # If counts match perfectly, score is high
        if self.report["total_images"] != self.report["total_labels"]:
            self.report["score"] -= 10
            self.report["issues"].append({
                "title": "Label Mismatch",
                "severity": "warning",
                "desc": f"Mismatch detected: {self.report['total_images']} images vs {self.report['total_labels']} labels."
            })