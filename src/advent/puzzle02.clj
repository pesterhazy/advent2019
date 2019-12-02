(ns advent.puzzle02
  (:require [advent.util]))

(defn parse-state [s]
  {:mem (->> (clojure.string/split s #",")
             (map #(Long/parseLong %))
             vec),
   :ip 0})

(defn next-state [{:keys [ip mem] :as state}]
  (let [mget (fn [addr] (nth mem addr))
        mget-rel (fn [rel-addr] (mget (+ ip rel-addr)))
        mset (fn [state addr val] (assoc state :mem (assoc mem addr val)))
        mjump-rel (fn [state rel-addr] (assoc state :ip (+ ip rel-addr)))]
    (case (mget-rel 0)
      1
      (-> state
          (mset (mget-rel 3) (+ (mget (mget-rel 1)) (mget (mget-rel 2))))
          (mjump-rel 4))
      2
      (-> state
          (mset (mget-rel 3) (* (mget (mget-rel 1)) (mget (mget-rel 2))))
          (mjump-rel 4))

      99
      (assoc state :halted? true))))

(defn solution []
  (->> (iterate next-state (parse-state "1,9,10,3,2,3,11,0,99,30,40,50"))
       (take-while #(not (:halted? %)))))
